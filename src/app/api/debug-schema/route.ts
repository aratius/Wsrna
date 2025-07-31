import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // quiz_reviewsテーブルの構造を確認
    const { data: reviews, error } = await supabase
      .from('quiz_reviews')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: error.message,
        details: error
      }, { status: 500 });
    }

    // テーブル構造を推測
    const sampleReview = reviews?.[0];
    const columns = sampleReview ? Object.keys(sampleReview) : [];

    return NextResponse.json({
      tableExists: true,
      columns: columns,
      sampleData: sampleReview,
      hasCorrectStreak: columns.includes('correct_streak')
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error
    }, { status: 500 });
  }
}