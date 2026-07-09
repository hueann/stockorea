import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabaseServer';

function licenseNo() {
  const y = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SK-${y}-${rand}`;
}

export async function GET(req) {
  const url = new URL(req.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const paymentKey = url.searchParams.get('paymentKey');
  const orderId = url.searchParams.get('orderId');
  const amount = url.searchParams.get('amount');

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(`${site}/checkout/fail?message=잘못된 결제 요청입니다.`);
  }

  const a = admin();

  // 1) 대기 주문 검증 (금액 위변조 방지)
  const { data: purchase } = await a.from('purchases').select('*').eq('id', orderId).single();
  if (!purchase || purchase.status !== 'pending' || String(purchase.amount) !== String(amount)) {
    return NextResponse.redirect(`${site}/checkout/fail?message=주문 정보가 일치하지 않습니다.`);
  }

  // 2) 토스페이먼츠 결제 승인
  const basic = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64');
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    await a.from('purchases').update({ status: 'failed' }).eq('id', orderId);
    return NextResponse.redirect(
      `${site}/checkout/fail?message=${encodeURIComponent(body.message || '결제 승인에 실패했습니다.')}`
    );
  }

  // 3) 구매 확정 + 라이선스 발급
  await a.from('purchases').update({ status: 'paid', payment_key: paymentKey }).eq('id', orderId);
  await a.from('licenses').insert({
    purchase_id: purchase.id,
    user_id: purchase.user_id,
    asset_id: purchase.asset_id,
    license_no: licenseNo(),
  });

  return NextResponse.redirect(`${site}/mypage?paid=1`);
}
