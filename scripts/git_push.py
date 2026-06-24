#!/usr/bin/env python3
"""Push git repo via SSH using paramiko (no system ssh needed)"""
import subprocess, sys, os, threading

wrapper = '''#!/usr/bin/env python3
import paramiko, sys, os, threading

args = list(sys.argv[1:])
host = None
port = 22
cmd_args = []
i = 0
while i < len(args):
    a = args[i]
    if a == "-p" and i+1 < len(args):
        port = int(args[i+1]); i += 2; continue
    if a == "-o" and i+1 < len(args):
        i += 2; continue
    if a.startswith("-"): i += 1; continue
    if host is None:
        host = a
    else:
        cmd_args.append(a)
    i += 1

if not host:
    sys.exit(1)

user = "git"
if "@" in host:
    user, host = host.split("@", 1)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

connected = False
for kp in [os.path.expanduser(f"~/.ssh/id_{t}") for t in ["ed25519","rsa","ecdsa"]]:
    if os.path.exists(kp):
        for key_cls in [paramiko.Ed25519Key, paramiko.RSAKey, paramiko.ECDSAKey]:
            try:
                key = key_cls.from_private_key_file(kp)
                client.connect(host, port=port, username=user, pkey=key, look_for_keys=False, timeout=30, banner_timeout=30, auth_timeout=30)
                connected = True; break
            except: pass
        if connected: break

if not connected:
    sys.exit(1)

chan = client.get_transport().open_session()
cmd = " ".join(cmd_args) if cmd_args else ""
chan.exec_command(cmd)

def pipe_r(src, dst):
    try:
        while True:
            d = src.read(4096)
            if not d: break
            dst.buffer.write(d); dst.buffer.flush()
    except: pass

t1 = threading.Thread(target=pipe_r, args=(chan, sys.stdout), daemon=True)
t2 = threading.Thread(target=pipe_r, args=(chan, sys.stderr), daemon=True)
t3 = threading.Thread(target=pipe_r, args=(sys.stdin, chan), daemon=True)
t1.start(); t2.start(); t3.start()
chan.recv_exit_status()
client.close()
'''

wrapper_path = '/home/z/my-project/ssh_wrapper.py'
with open(wrapper_path, 'w') as f:
    f.write(wrapper)
os.chmod(wrapper_path, 0o755)

os.chdir('/home/z/my-project')
env = {**os.environ, 'GIT_SSH': wrapper_path}

subprocess.run(['git', 'remote', 'set-url', 'origin', 'git@github.com:playbeat575-ctrl/vbn.git'], check=True, env=env)

result = subprocess.run(['git', 'push', '-u', 'origin', 'main'], 
                       capture_output=True, text=True, timeout=120, env=env)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
sys.exit(result.returncode)