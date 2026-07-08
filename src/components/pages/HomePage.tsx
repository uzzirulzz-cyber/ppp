'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore, Pages } from '@/store/useStore';
import Image from 'next/image';
import {
  Shield,
  Zap,
  BarChart3,
  HeadphonesIcon,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Brock Exchange Theme — Black / Gold / Neon Cyan
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bgDarkest: '#07090f',
  bgSecondary: '#10141d',
  bgCard: '#171c28',
  gold: '#f5b400',
  goldHover: '#ffd54f',
  cyan: '#00e5ff',
  green: '#00d26a',
  red: '#ff3d57',
  text: '#ffffff',
  textSec: '#b9c2d0',
  textMuted: '#6b7a8d',
  border: '#2a3042',
  gradient: 'linear-gradient(135deg, #f5b400, #00e5ff)',
  glowGold: '0 0 20px rgba(245, 180, 0, 0.35)',
  glowCyan: '0 0 20px rgba(0, 229, 255, 0.30)',
  radius: '18px',
  shadow: '0 10px 40px rgba(0,0,0,.45)',
};

/* ═══════════════════════════════════════════════════════════════
   Crypto Data
   ═══════════════════════════════════════════════════════════════ */
interface Coin {
  symbol: string;
  name: string;
  price: string;
  change: number;
  color: string;
  letter: string;
}

const coins: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: '$67,432.18', change: 2.34, color: '#f7931a', letter: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: '$3,521.45', change: 1.87, color: '#627eea', letter: 'Ξ' },
  { symbol: 'BNB', name: 'BNB', price: '$612.30', change: -0.92, color: '#f3ba2f', letter: 'B' },
  { symbol: 'SOL', name: 'Solana', price: '$178.65', change: 5.21, color: '#00ffa3', letter: 'S' },
  { symbol: 'XRP', name: 'XRP', price: '$0.6234', change: -1.45, color: '#00aae4', letter: 'X' },
  { symbol: 'ADA', name: 'Cardano', price: '$0.4812', change: 3.67, color: '#0033ad', letter: 'A' },
  { symbol: 'DOGE', name: 'Dogecoin', price: '$0.1589', change: -2.13, color: '#c2a633', letter: 'D' },
  { symbol: 'DOT', name: 'Polkadot', price: '$7.34', change: 1.02, color: '#e6007a', letter: 'P' },
];

const tickerCoins = [
  { symbol: 'BTC', price: '$67,432.18', change: 2.34 },
  { symbol: 'ETH', price: '$3,521.45', change: 1.87 },
  { symbol: 'BNB', price: '$612.30', change: -0.92 },
  { symbol: 'SOL', price: '$178.65', change: 5.21 },
  { symbol: 'XRP', price: '$0.6234', change: -1.45 },
  { symbol: 'ADA', price: '$0.4812', change: 3.67 },
  { symbol: 'DOGE', price: '$0.1589', change: -2.13 },
  { symbol: 'DOT', price: '$7.34', change: 1.02 },
  { symbol: 'AVAX', price: '$38.72', change: 4.15 },
  { symbol: 'MATIC', price: '$0.7123', change: -0.34 },
  { symbol: 'LINK', price: '$18.45', change: 2.89 },
  { symbol: 'UNI', price: '$12.67', change: -1.78 },
];

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: 'Multi-layer encryption, cold storage for 95% of assets, and real-time threat monitoring keep your funds safe 24/7.',
  },
  {
    icon: Zap,
    title: 'Lightning Execution',
    desc: 'Our matching engine processes 1.4 million orders per second with sub-millisecond latency for instant fills.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Professional charting tools, real-time market data, and AI-powered insights to help you make informed decisions.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Expert Support',
    desc: 'Dedicated support team available around the clock via live chat, email, and phone to assist you anytime.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create Account',
    desc: 'Sign up in under 2 minutes with just your email. Complete identity verification for full access.',
  },
  {
    num: '02',
    title: 'Fund Your Wallet',
    desc: 'Deposit via bank transfer, credit card, or crypto. Multiple currencies and zero-fee deposits supported.',
  },
  {
    num: '03',
    title: 'Start Trading',
    desc: 'Access 200+ trading pairs with spot and futures markets. Execute trades with one click.',
  },
];

const footerColumns = [
  {
    title: 'About',
    links: ['About Us', 'Careers', 'Blog', 'Press'],
  },
  {
    title: 'Products',
    links: ['Spot Trading', 'Futures', 'Staking', 'NFTs'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'API Docs', 'Status', 'Contact Us'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Compliance', 'Licenses'],
  },
];

const socialLinks = ['Twitter', 'Telegram', 'Discord', 'GitHub', 'Reddit'];

/* ═══════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};



const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

/* ═══════════════════════════════════════════════════════════════
   Section Wrapper
   ═══════════════════════════════════════════════════════════════ */
function Section({
  id,
  children,
  style,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <section
      id={id}
      style={{ width: '100%', ...style }}
      className={className}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' }}>
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Navigation Bar
   ═══════════════════════════════════════════════════════════════ */
function Navbar() {
  const { navigate } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: scrolled
          ? 'rgba(12, 15, 22, 0.95)'
          : 'rgba(12, 15, 22, 0.9)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(255,255,255,0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: '100%',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Image
            src="/logo.png"
            alt="Brock Exchange"
            width={36}
            height={36}
            style={{ borderRadius: 8 }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: T.text, letterSpacing: '-0.5px' }}>
            Brock{' '}
            <span style={{ color: T.gold }}>Exchange</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          className="hidden md:flex"
        >
          {[
            { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { label: 'Markets', action: () => scrollTo('markets') },
            { label: 'Trade', action: () => scrollTo('features') },
          ].map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              style={{
                background: 'none',
                border: 'none',
                color: T.textSec,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.textSec)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(Pages.LOGIN)}
            style={{
              background: 'transparent',
              border: `1px solid ${T.cyan}`,
              color: T.cyan,
              padding: '9px 24px',
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)';
              e.currentTarget.style.boxShadow = T.glowCyan;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate(Pages.LOGIN)}
            style={{
              background: T.gradient,
              border: 'none',
              color: T.bgDarkest,
              padding: '9px 24px',
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: T.glowGold,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(245, 180, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = T.glowGold;
            }}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
          aria-label="Toggle menu"
        >
          <span
            style={{
              width: 22,
              height: 2,
              background: T.text,
              borderRadius: 2,
              transition: 'all 0.3s',
              transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
            }}
          />
          <span
            style={{
              width: 22,
              height: 2,
              background: T.text,
              borderRadius: 2,
              transition: 'all 0.3s',
              opacity: mobileOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              width: 22,
              height: 2,
              background: T.text,
              borderRadius: 2,
              transition: 'all 0.3s',
              transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 75,
            left: 0,
            right: 0,
            background: 'rgba(12, 15, 22, 0.98)',
            backdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${T.border}`,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {[
            { label: 'Home', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileOpen(false); } },
            { label: 'Markets', action: () => scrollTo('markets') },
            { label: 'Trade', action: () => scrollTo('features') },
          ].map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              style={{
                background: 'none',
                border: 'none',
                color: T.textSec,
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                padding: '8px 0',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={() => navigate(Pages.LOGIN)}
              style={{
                flex: 1,
                background: 'transparent',
                border: `1px solid ${T.cyan}`,
                color: T.cyan,
                padding: '12px 20px',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate(Pages.LOGIN)}
              style={{
                flex: 1,
                background: T.gradient,
                border: 'none',
                color: T.bgDarkest,
                padding: '12px 20px',
                borderRadius: 40,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Hero Section
   ═══════════════════════════════════════════════════════════════ */
function HeroSection() {
  const { navigate } = useStore();

  const scrollToMarkets = () => {
    const el = document.getElementById('markets');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #1b2238 0%, #07090f 70%)',
        paddingTop: 75,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, rgba(245,180,0,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1200, padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 40,
            background: 'rgba(245, 180, 0, 0.1)',
            border: '1px solid rgba(245, 180, 0, 0.25)',
            marginBottom: 28,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.gold, display: 'inline-block' }} />
          <span style={{ color: T.gold, fontSize: 13, fontWeight: 600, letterSpacing: '0.5px' }}>
            TRUSTED BY 150K+ TRADERS WORLDWIDE
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 800,
            color: T.text,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-1px',
          }}
        >
          Trade Crypto with{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Confidence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: T.textSec,
            maxWidth: 660,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          Brock Exchange offers institutional-grade trading with lightning-fast execution,
          deep liquidity, and 24/7 support.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => navigate(Pages.LOGIN)}
            style={{
              background: T.gradient,
              border: 'none',
              color: T.bgDarkest,
              padding: '16px 40px',
              borderRadius: 40,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: T.glowGold,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(245, 180, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = T.glowGold;
            }}
          >
            Start Trading
            <ArrowRight size={18} />
          </button>
          <button
            onClick={scrollToMarkets}
            style={{
              background: 'transparent',
              border: `1.5px solid ${T.cyan}`,
              color: T.cyan,
              padding: '16px 40px',
              borderRadius: 40,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
              e.currentTarget.style.boxShadow = T.glowCyan;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Explore Markets
            <ChevronRight size={18} />
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 24,
            marginTop: 72,
            padding: '32px 0',
            borderTop: `1px solid ${T.border}`,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {[
            { value: '$2.5B+', label: 'Trading Volume', icon: TrendingUp },
            { value: '150K+', label: 'Active Traders', icon: Users },
            { value: '99.99%', label: 'Uptime', icon: Clock },
            { value: '24/7', label: 'Support', icon: HeadphonesIcon },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <stat.icon size={18} style={{ color: T.gold, marginBottom: 2 }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: `linear-gradient(to bottom, transparent, ${T.bgDarkest})`,
          pointerEvents: 'none',
        }}
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Crypto Card
   ═══════════════════════════════════════════════════════════════ */
function CryptoCard({ coin, index }: { coin: Coin; index: number }) {
  const { navigate, setSelectedCoin } = useStore();
  const [hovered, setHovered] = useState(false);

  const handleTrade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCoin(coin.symbol);
    navigate(Pages.TRADING);
  };

  const handleCardClick = () => {
    setSelectedCoin(coin.symbol);
    navigate(Pages.TRADING);
  };

  const isPositive = coin.change >= 0;

  return (
    <motion.div
      custom={index}
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bgCard,
        border: hovered ? `1px solid ${T.gold}` : '1px solid rgba(255,255,255,0.08)',
        borderRadius: T.radius,
        boxShadow: hovered ? `${T.shadow}, 0 0 20px rgba(245,180,0,0.15)` : T.shadow,
        padding: 24,
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top gradient line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: hovered ? T.gradient : 'transparent',
          transition: 'background 0.3s',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Coin Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: `${coin.color}20`,
              border: `2px solid ${coin.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              color: coin.color,
            }}
          >
            {coin.letter}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{coin.name}</div>
            <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{coin.symbol}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: T.text, letterSpacing: '-0.5px' }}>
          {coin.price}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 8,
            background: isPositive ? 'rgba(0, 210, 106, 0.12)' : 'rgba(255, 61, 87, 0.12)',
          }}
        >
          <TrendingUp
            size={13}
            style={{
              color: isPositive ? T.green : T.red,
              transform: isPositive ? 'none' : 'rotate(180deg)',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isPositive ? T.green : T.red,
            }}
          >
            {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
          </span>
        </div>

        <button
          onClick={handleTrade}
          style={{
            background: hovered ? T.gradient : 'transparent',
            border: `1px solid ${hovered ? 'transparent' : T.border}`,
            color: hovered ? T.bgDarkest : T.gold,
            padding: '6px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Trade
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Featured Cryptocurrencies Section
   ═══════════════════════════════════════════════════════════════ */
function FeaturedSection() {
  return (
    <Section
      id="markets"
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: T.bgDarkest,
      }}
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 700,
            color: T.gold,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 12,
          }}
        >
          Live Markets
        </span>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          Popular{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Cryptocurrencies
          </span>
        </h2>
        <p style={{ fontSize: 16, color: T.textSec, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Trade the most popular digital assets with the best spreads and deep liquidity.
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {coins.map((coin, i) => (
          <CryptoCard key={coin.symbol} coin={coin} index={i} />
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Why Choose Us Section
   ═══════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <Section
      id="features"
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: T.bgSecondary,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 700,
            color: T.cyan,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 12,
          }}
        >
          Why Brock Exchange
        </span>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          Why Choose{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Us
          </span>
        </h2>
        <p style={{ fontSize: 16, color: T.textSec, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Built for traders who demand the best. Our platform combines cutting-edge technology with unmatched reliability.
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 20,
        }}
      >
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isHovered = hoveredIdx === idx;
          return (
            <motion.div
              key={feat.title}
              custom={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                background: T.bgCard,
                border: isHovered ? `1px solid ${T.gold}` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: T.radius,
                boxShadow: isHovered ? `${T.shadow}, 0 0 20px rgba(245,180,0,0.15)` : T.shadow,
                padding: '32px 24px',
                textAlign: 'center',
                transition: 'all 0.35s ease',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: T.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: isHovered ? T.glowGold : 'none',
                  transition: 'box-shadow 0.3s',
                }}
              >
                <Icon size={28} color={T.bgDarkest} strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: T.text,
                  marginBottom: 12,
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: T.textSec,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {feat.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   How It Works Section
   ═══════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const { navigate } = useStore();

  return (
    <Section
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: T.bgDarkest,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 700,
            color: T.gold,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 12,
          }}
        >
          Getting Started
        </span>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          How It{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Works
          </span>
        </h2>
        <p style={{ fontSize: 16, color: T.textSec, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          Get started in minutes and begin trading on one of the world&apos;s most advanced platforms.
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 40,
          position: 'relative',
        }}
      >
        {/* Connector lines (desktop only) */}
        <div
          className="hidden lg:block"
          style={{
            position: 'absolute',
            top: 50,
            left: 'calc(33.33% - 20px)',
            right: 'calc(33.33% - 20px)',
            height: 2,
            background: `linear-gradient(to right, ${T.gold}40, ${T.cyan}40)`,
            zIndex: 0,
          }}
        />

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: T.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: T.glowGold,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: T.bgDarkest }}>
                {step.num}
              </span>
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: T.text,
                marginBottom: 12,
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: T.textSec,
                lineHeight: 1.7,
                margin: 0,
                maxWidth: 300,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA under steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ textAlign: 'center', marginTop: 56 }}
      >
        <button
          onClick={() => navigate(Pages.REGISTER)}
          style={{
            background: T.gradient,
            border: 'none',
            color: T.bgDarkest,
            padding: '16px 40px',
            borderRadius: 40,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: T.glowGold,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 35px rgba(245, 180, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = T.glowGold;
          }}
        >
          Create Free Account
          <ArrowRight size={18} />
        </button>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Live Market Ticker
   ═══════════════════════════════════════════════════════════════ */
function MarketTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { navigate, setSelectedCoin } = useStore();

  // Duplicate items for seamless loop
  const tickerItems = [...tickerCoins, ...tickerCoins];

  return (
    <div
      style={{
        background: T.bgSecondary,
        padding: '20px 0',
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        overflow: 'hidden',
      }}
    >
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 0,
          animation: 'ticker-scroll 30s linear infinite',
          width: 'max-content',
        }}
      >
        {tickerItems.map((coin, i) => {
          const isPositive = coin.change >= 0;
          return (
            <div
              key={`${coin.symbol}-${i}`}
              onClick={() => {
                setSelectedCoin(coin.symbol);
                navigate(Pages.TRADING);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 28px',
                borderRight: `1px solid ${T.border}`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
                minWidth: 200,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{coin.symbol}</span>
              <span style={{ fontSize: 14, color: T.textSec, fontWeight: 500 }}>{coin.price}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isPositive ? T.green : T.red,
                  background: isPositive ? 'rgba(0,210,106,0.12)' : 'rgba(255,61,87,0.12)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CTA Section
   ═══════════════════════════════════════════════════════════════ */
function CTASection() {
  const { navigate } = useStore();

  return (
    <Section
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        background: `radial-gradient(ellipse at center, #141a2a 0%, ${T.bgDarkest} 70%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(245,180,0,0.05) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '60px 24px',
          background: `linear-gradient(135deg, rgba(23,28,40,0.8), rgba(16,20,29,0.9))`,
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: T.shadow,
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            color: T.text,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          Ready to Start{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Trading?
          </span>
        </h2>
        <p
          style={{
            fontSize: 17,
            color: T.textSec,
            marginBottom: 36,
            maxWidth: 480,
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Join thousands of traders on Brock Exchange and experience the future of digital asset trading.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(Pages.REGISTER)}
            style={{
              background: T.gradient,
              border: 'none',
              color: T.bgDarkest,
              padding: '16px 40px',
              borderRadius: 40,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: T.glowGold,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(245, 180, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = T.glowGold;
            }}
          >
            Create Account
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer
      style={{
        background: '#090c13',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 64,
        paddingBottom: 32,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Top section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* About column / Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Image
                src="/logo.png"
                alt="Brock Exchange"
                width={32}
                height={32}
                style={{ borderRadius: 6 }}
              />
              <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
                Brock <span style={{ color: T.gold }}>Exchange</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7, margin: 0, maxWidth: 260 }}>
              The next-generation crypto trading platform built for speed, security, and reliability.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.text,
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {col.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={{
                      fontSize: 14,
                      color: T.textMuted,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = T.gold)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            marginBottom: 24,
          }}
        />

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 13, color: T.textMuted }}>
            © 2024 Brock Exchange. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            {socialLinks.map((s) => (
              <a
                key={s}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: 13,
                  color: T.textMuted,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.gold)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HomePage Component
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {

  useEffect(() => {
    document.body.classList.add('landing-active');
    document.body.style.background = T.bgDarkest;
    return () => {
      document.body.classList.remove('landing-active');
      document.body.style.background = '';
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bgDarkest, overflowX: 'hidden' }}>
      <Navbar />
      <HeroSection />
      <MarketTicker />
      <FeaturedSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}