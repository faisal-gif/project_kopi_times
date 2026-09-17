# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want their opinion pieces published in a national outlet: academics and lecturers, public officials and public figures (regional heads, DPR members), professionals and practitioners (doctors, psychologists, lawyers), and general writers and students. They arrive wanting to know whether writing here is worth it, whether it will reach readers, and how to join.

## Product Purpose

Kopi TIMES (Kolom Opini) is the opinion channel of TIMES Indonesia, run as a paid writer membership. Members get CMS access and a writing quota to publish opinion pieces on TIMES Indonesia, a writer member card, and package-dependent distribution (Instagram feed, e-koran, WhatsApp Channel, bonus items/merchandise). Success for the landing page is registration (`/register`) or checkout of a package (`/checkout?package_id=`).

## Positioning

Not a blog platform: writing is published by an established national newsroom (TIMES Indonesia, Malang), editorially screened against published criteria, indexed by search engines, and backed by a physical identity (member card, photo frame) plus distribution across TIMES channels.

## Operating Context

- Laravel + Inertia + React, Tailwind v4 + daisyUI theme `times`; shared `LandingLayout` navbar and footer are out of scope for landing redesigns.
- Packages come from the database (`newsPackages`: name, price, period, level, quota, feed_instagram, ekoran, wa_channel, items_lainnya, popular). Level 1 links to `/register`, level 2 to `/checkout`.
- Writing criteria (editorial): original, exclusive, actual and relevant, public interest, new perspective, popular language, max 4,000 characters (~600 words), single author.

## Brand Commitments

- Name "Kopi TIMES" and the logo `public/logo-web.png` must be kept.
- Part of TIMES Indonesia; historical brand color burgundy `#7b0f1f` (not binding for the landing page).
- Copy is Bahasa Indonesia.

## Evidence on Hand

- Stats confirmed by the owner: 10K+ articles, 5K+ writers, 1M+ readers. The Tentang page figures (10,000+ writers, 50,000+ articles, 100+ awards) are NOT confirmed; do not reuse them.
- Testimonial images (8) on CDN `cdn2.timesmedia.co.id/.../testimonial-cdn-{1..8}-*.webp`: dr. Karolon Margret Natasa, MH. (Bupati Landak), Drs. Cornelis, M.H. (DPR RI), Tri Gunadi (psychologist, Untag Surabaya).
- Member card background `public/templates/card_bg.jpeg`, photo frames `public/images/frame-kopitimes.png`, `public/templates/frame.png`, `frame_putih.png`.
- No real article samples are approved for the landing page; do not fabricate writer names, article titles, or quotes presented as real.

## Product Principles

1. Show the benefit a writer can see and hold (published byline, member card, distribution), not abstract value claims.
2. Only confirmed numbers and real testimonials; never invent social proof.
3. Make the editorial bar explicit: selectivity is part of the value.
4. Registration must be reachable from every screenful.
