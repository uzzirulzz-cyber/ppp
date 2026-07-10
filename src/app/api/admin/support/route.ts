import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/support — Support tickets (not yet implemented)
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Support ticket system is not yet implemented',
    tickets: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    message: 'Support ticket system is not yet implemented',
  }, { status: 501 });
}