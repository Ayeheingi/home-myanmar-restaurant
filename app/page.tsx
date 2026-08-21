'use client';

import { useEffect, useMemo, useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const sitePath = (path: string) => `${basePath}${path}`;

type Food = {
  id: number; mm: string; jp: string; description: string; price: number;
  category: string; image: string; popular?: boolean; special?: boolean;
  optionTitle: string;
  options: { id: string; label: string; price: number }[];
  defaultOption: string;
  defaultSpice: string;
  toppings: { id: string; label: string; price: number }[];
  secondaryTitle?: string;
  secondaryOptions?: { id: string; label: string; price: number }[];
  defaultSecondary?: string;
  spiceTitle?: string;
  flavors?: { id: string; label: string }[];
  hideSpice?: boolean;
  multiTitle?: string;
  multiOptions?: { id: string; label: string }[];
  selectionLimit?: Record<string, number>;
};
type CartItem = Food & {
  quantity: number; selectedOption: string; selectedSpice: string;
  selectedSecondary: string; selectedMulti: string[];
  selectedToppings: string[]; note: string; unitPrice: number;
};
type OrderRecord = {
  id: string; items: CartItem[]; total: number; method: 'delivery' | 'pickup';
  receiveTime: string; createdAt: string; status: OrderStatus; payment: string;
  subtotal: number; deliveryFee: number; discount: number;
  customer?: { name: string; phone: string; address: string };
};
type OrderStatus = '受付' | '調理中' | '配達中' | '受取待ち' | '完了';
type FilterPrice = 'all' | 'under800' | '800to999' | '1000plus';
type FilterSpice = 'all' | 'none' | 'mild' | 'normal' | 'hot';

const DELIVERY_FEE = 300;
const FREE_DELIVERY_THRESHOLD = 2000;

const categories = [
  { id: 'popular', icon: '✦', jp: '人気', mm: 'လူကြိုက်များ' },
  { id: 'curry', icon: '◒', jp: 'ご飯・カレー', mm: 'ထမင်း ဟင်း' },
  { id: 'noodle', icon: '≋', jp: '麺料理', mm: 'ခေါက်ဆွဲ' },
  { id: 'salad', icon: '✾', jp: 'サラダ', mm: 'အသုပ်' },
  { id: 'snack', icon: '◇', jp: '軽食', mm: 'အဆာပြေ' },
  { id: 'dessert', icon: '◐', jp: 'デザート', mm: 'အချိုပွဲ' },
  { id: 'drink', icon: '◌', jp: 'ドリンク', mm: 'အအေး' },
];

const spiceOptions = [
  { id: 'none', label: 'မစပ် / 辛くない' },
  { id: 'mild', label: 'အနည်းငယ်စပ် / ひかえめ' },
  { id: 'normal', label: 'ပုံမှန်စပ် / 普通' },
  { id: 'hot', label: 'အစပ် / 辛口' },
];

const foods: Food[] = ([
  { id: 1, mm: 'မုန့်ဟင်းခါး', jp: 'モヒンガー', price: 850, category: 'noodle', popular: true,
    description: 'レモングラスが香る魚だしの米麺スープ。ミャンマーの国民的な朝ごはんです。',
    image: '/mohinga.webp',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{ id:'regular',label:'ပုံမှန် / 普通',price:0 },{ id:'large',label:'အကြီး / 大盛り',price:200 }],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'fritter',label:'အကြော် / 揚げ物',price:150},{id:'fishcake',label:'ငါးဖယ် / フィッシュケーキ',price:200},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 2, mm: 'ရှမ်းခေါက်ဆွဲ', jp: 'シャンヌードル', price: 900, category: 'noodle', popular: true,
    description: '鶏肉とトマトの旨み、香ばしいナッツが調和するシャン州の人気麺料理。',
    image: '/shan-noodles.webp',
    optionTitle: 'အမျိုးအစားရွေးပါ / 種類を選択', defaultOption: 'dry', defaultSpice: 'mild',
    options: [{id:'dry',label:'အသုပ် / 汁なし',price:0},{id:'soup',label:'အရည် / スープ',price:0}],
    toppings: [{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'greens',label:'အစိမ်းရွက်အပို / 青菜追加',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 3, mm: 'တိုဖူးနွေး', jp: '温かいひよこ豆豆腐麺', price: 900, category: 'noodle', popular: true, special: true,
    description: 'なめらかなひよこ豆豆腐を麺に絡めた、やさしく香ばしいシャンの郷土料理。',
    image: '/tofu-nway.webp',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'bread',label:'အီကြာကွေး / 揚げパン',price:150},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'tofu',label:'တိုဖူးနွေးအပို / ひよこ豆豆腐追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100}] },
  { id: 4, mm: 'အုန်းနို့ခေါက်ဆွဲ', jp: 'オンノカウスエ', price: 950, category: 'noodle', popular: true,
    description: 'ココナッツミルクのコクと鶏肉の旨みが広がる、クリーミーな麺料理。',
    image: '/ohn-no-khao-swe.webp',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'crispy',label:'အကြွပ်ခေါက်ဆွဲ / 揚げ麺追加',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 5, mm: 'ကြေးအိုး', jp: 'チェーオー', price: 950, category: 'noodle', popular: true,
    description: '豚肉団子と野菜、米麺を楽しむ、澄んだスープのミャンマー定番麺。',
    image: '/kyay-oh.webp',
    optionTitle: 'အမျိုးအစားရွေးပါ / 種類を選択', defaultOption: 'soup', defaultSpice: 'none',
    options: [{id:'soup',label:'အရည် / スープ',price:0},{id:'oil',label:'ဆီချက် / 汁なし・油和え',price:0}],
    toppings: [{id:'meatball',label:'ဝက်သားလုံးအပို / 豚肉団子追加',price:200},{id:'pork',label:'ဝက်သားအပို / 豚肉追加',price:200},{id:'quail',label:'ငုံးဥအပို / うずら卵追加',price:100},{id:'greens',label:'အစိမ်းရွက်အပို / 青菜追加',price:100},{id:'noodle',label:'ကြာဆံအပို / 麺追加',price:150}] },
  { id: 6, mm: 'နန်းကြီးသုပ်', jp: 'ナンジートゥ', price: 900, category: 'noodle', popular: true,
    description: '太い米麺に鶏肉とひよこ豆粉を絡めた、コクのある和え麺。',
    image: '/nan-gyi-thoke.webp',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'onion',label:'ကြက်သွန်ကြော် / フライドオニオン',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 7, mm: 'ကြက်သားဒံပေါက်', jp: 'チキンダンバウ', price: 1100, category: 'curry', popular: true,
    description: '香り高いスパイスで炊いたご飯に、やわらかな鶏肉を合わせたミャンマー式ビリヤニ。',
    image: '/chicken-danbauk.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:250}],
    toppings: [{id:'egg',label:'ကြက်ဥပြုတ် / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:250},{id:'rice',label:'ထမင်းအပို / ライス追加',price:150},{id:'salad',label:'သုပ်အပို / サラダ追加',price:150}] },
  { id: 8, mm: 'ဇလုံထမင်းနယ်', jp: 'ミャンマー風混ぜご飯', price: 950, category: 'curry', popular: true,
    description: 'ご飯とおかず、野菜を大きな器で混ぜ合わせて楽しむ、家庭的な一皿。',
    image: '/myanmar-mixed-rice.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    secondaryTitle: 'အဓိကဟင်းရွေးပါ / メインを選択', defaultSecondary: 'chicken',
    secondaryOptions: [{id:'chicken',label:'ကြက်သား / 鶏肉',price:0},{id:'fish',label:'ငါး / 魚',price:0},{id:'egg',label:'ကြက်ဥ / 卵',price:0},{id:'vegetable',label:'အသီးအရွက် / 野菜',price:0}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'vegetable',label:'ဟင်းသီးဟင်းရွက်အပို / 野菜追加',price:150},{id:'dried-fish',label:'ငါးခြောက်ကြော် / 干し魚炒め',price:200}] },
  { id: 9, mm: 'ပဲပြုတ်ထမင်း', jp: 'ゆで豆ご飯', price: 750, category: 'curry', popular: true,
    description: 'やわらかく茹でた豆とご飯を香味油で和えた、シンプルで滋味深い定番ごはん。',
    image: '/boiled-bean-rice.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:150}],
    secondaryTitle: 'အရသာရွေးပါ / 味を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'normal',label:'ပုံမှန် / 普通',price:0},{id:'less-oil',label:'ဆီနည်း / 油少なめ',price:0},{id:'less-salt',label:'ဆားနည်း / 塩少なめ',price:0}],
    toppings: [{id:'fried-egg',label:'ကြက်ဥကြော် / 目玉焼き',price:150},{id:'beans',label:'ပဲပြုတ်အပို / ゆで豆追加',price:100},{id:'dried-fish',label:'ငါးခြောက်ကြော် / 干し魚炒め',price:200},{id:'rice',label:'ထမင်းအပို / ライス追加',price:150}] },
  { id: 10, mm: 'မြန်မာကြက်သားဟင်း', jp: 'ミャンマー風チキンカレー', price: 900, category: 'curry', popular: true,
    description: '玉ねぎとスパイスをじっくり煮込んだ、鶏肉の旨みたっぷりのミャンマーカレー。',
    image: '/myanmar-chicken-curry.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'extra-chicken',label:'ကြက်သားအပို / 鶏肉大盛り',price:250}],
    toppings: [{id:'rice',label:'ထမင်း / ライス',price:200},{id:'potato',label:'အာလူးအပို / じゃがいも追加',price:100},{id:'sauce',label:'ဟင်းရည်အပို / カレーソース追加',price:100}] },
  { id: 11, mm: 'မြန်မာငါးဟင်း', jp: 'ミャンマー風魚料理', price: 1000, category: 'curry', popular: true,
    description: '魚の旨みを生かした、香り豊かなミャンマーの家庭料理。',
    image: '/myanmar-fish-curry.webp', optionTitle: 'ချက်ပြုတ်ပုံရွေးပါ / 調理方法を選択', defaultOption: 'curry', defaultSpice: 'mild', spiceTitle: 'အရသာရွေးပါ / 味を選択',
    flavors: [{id:'sweet',label:'အချို / 甘口'},{id:'mild',label:'အနည်းငယ်စပ် / ひかえめ'},{id:'normal',label:'ပုံမှန်စပ် / 普通'},{id:'hot',label:'အစပ် / 辛口'}],
    options: [{id:'curry',label:'ငါးဟင်းချက် / 魚カレー',price:0},{id:'fried',label:'ငါးကြော် / 魚の唐揚げ',price:0}],
    toppings: [{id:'rice',label:'ထမင်း / ライス',price:200},{id:'fish',label:'ငါးအပို / 魚追加',price:300},{id:'sauce',label:'ဟင်းရည်အပို / ソース追加',price:100}] },
  { id: 12, mm: 'အသည်းပန်းဂေါ်ဖီကြော်', jp: 'レバーとカリフラワー炒め', price: 850, category: 'curry', popular: true,
    description: 'コクのあるレバーと歯ざわりの良いカリフラワーを香ばしく炒めました。',
    image: '/liver-cauliflower.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'liver',label:'အသည်းအပို / レバー追加',price:200},{id:'cauliflower',label:'ပန်းဂေါ်ဖီအပို / カリフラワー追加',price:100},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 13, mm: 'ကြက်ဟင်းခါးသီးကြက်ဥကြော်', jp: 'ゴーヤと卵炒め', price: 750, category: 'curry', popular: true,
    description: 'ゴーヤのほろ苦さをふんわり卵が包む、やさしい味わいの炒め物。',
    image: '/bitter-melon-egg.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'none',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥအပို / 卵追加',price:100},{id:'goya',label:'ကြက်ဟင်းခါးသီးအပို / ゴーヤ追加',price:150},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 14, mm: 'ငပိရည်ကြိုတို့စရာဗန်း', jp: 'ミャンマー風発酵魚ディップと野菜の盛り合わせ', price: 850, category: 'curry', popular: true,
    description: '発酵魚の深い旨みを楽しむディップと、彩り豊かな野菜の盛り合わせ。',
    image: '/ngapi-dip-platter.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:500}],
    toppings: [{id:'vegetable',label:'ဟင်းသီးဟင်းရွက်အပို / 野菜追加',price:200},{id:'dip',label:'ငပိရည်ကြိုအပို / ディップ追加',price:150},{id:'okra',label:'ရုံးပတီသီးအပို / オクラ追加',price:100},{id:'cucumber',label:'သခွားသီးအပို / きゅうり追加',price:100}] },
  { id: 15, mm: 'အစပ်ငါးခြောက်ကြော်', jp: 'ピリ辛干し魚炒め', price: 600, category: 'curry', popular: true,
    description: '干し魚と香味野菜を香ばしく炒めた、ご飯がすすむピリ辛の一品。',
    image: '/spicy-dried-fish.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'small', defaultSpice: 'mild',
    options: [{id:'small',label:'အသေး / 小',price:0},{id:'large',label:'အကြီး / 大',price:250}],
    toppings: [{id:'fish',label:'ငါးခြောက်အပို / 干し魚追加',price:200},{id:'onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 16, mm: 'မြန်မာမုန့်အစုံ', jp: 'ミャンマー菓子盛り合わせ', price: 800, category: 'dessert', popular: true,
    description: 'ミャンマーの伝統菓子を少しずつ楽しめる、彩り豊かな盛り合わせ。',
    image: '/myanmar-dessert-platter.webp', optionTitle: 'မုန့်အရေအတွက်ရွေးပါ / 種類数を選択', defaultOption: 'three', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'three',label:'သုံးမျိုး / 3種類',price:0},{id:'five',label:'ငါးမျိုး / 5種類',price:400}],
    multiTitle: 'ကြိုက်နှစ်သက်သောမုန့်ရွေးပါ / お菓子を選択', selectionLimit: {three:3,five:5},
    multiOptions: [{id:'semolina',label:'ဆနွင်းမကင်း / セモリナケーキ'},{id:'jelly',label:'ကျောက်ကျော / ミャンマー風ゼリー'},{id:'donut',label:'မုန့်လက်ကောက် / リングドーナツ'},{id:'steamed-cake',label:'မုန့်ပေါင်း / 蒸し菓子'},{id:'sticky-rice',label:'ကောက်ညှင်းပေါင်း / 蒸しもち米'},{id:'tapioca',label:'အုန်းနို့သာကူ / ココナッツミルクタピオカ'}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 17, mm: 'ဂျင်းသုပ်', jp: 'ミャンマー風生姜サラダ', price: 650, category: 'salad', popular: true,
    description: '香り豊かな生姜に豆や干しエビを合わせた、爽やかで食感の楽しいミャンマーサラダ。',
    image: '/ginger-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'ginger',label:'ဂျင်းအပို / 生姜追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 18, mm: 'ပဲဂေါ်ဖီသုပ်', jp: '豆とキャベツのサラダ', price: 600, category: 'salad', popular: true,
    description: '豆の香ばしさとキャベツの歯ざわりを楽しむ、軽やかなミャンマー風サラダ。',
    image: '/bean-cabbage-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'cabbage',label:'ဂေါ်ဖီအပို / キャベツ追加',price:100}] },
  { id: 19, mm: 'သရက်သီးသုပ်', jp: 'ミャンマー風青マンゴーサラダ', price: 650, category: 'salad', popular: true,
    description: '青マンゴーの酸味と香辛料が重なる、さっぱりとしたミャンマー定番サラダ。',
    image: '/green-mango-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'mango',label:'သရက်သီးအပို / 青マンゴー追加',price:150},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 20, mm: 'မုန့်လုံး', jp: 'ココナッツもち団子', price: 500, category: 'dessert', popular: true,
    description: 'もちもちの団子にココナッツをたっぷりまとわせた、やさしい甘さの伝統菓子。',
    image: '/coconut-mochi-balls.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'five', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'five',label:'၅ လုံး / 5個',price:0},{id:'eight',label:'၈ လုံး / 8個',price:250},{id:'twelve',label:'၁၂ လုံး / 12個',price:500}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ်အပို / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 21, mm: 'ပဲပလာတာ', jp: '豆カレーとパラタ', price: 750, category: 'snack', popular: true,
    description: '香ばしく焼いたパラタを、まろやかな豆カレーと一緒に楽しむ定番の軽食。',
    image: '/bean-curry-parata.webp', optionTitle: 'ပလာတာအရေအတွက်ရွေးပါ / パラタの枚数を選択', defaultOption: 'one', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'one',label:'၁ ချပ် / 1枚',price:0},{id:'two',label:'၂ ချပ် / 2枚',price:250},{id:'three',label:'၃ ချပ် / 3枚',price:450}],
    toppings: [{id:'bean-curry',label:'ပဲဟင်းအပို / 豆カレー追加',price:200},{id:'parata',label:'ပလာတာအပို / パラタ追加',price:250},{id:'fried-onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'egg',label:'ကြက်ဥ / 卵',price:150}] },
  { id: 22, mm: 'ကြာဆံဟင်းခါး', jp: 'ミャンマー風春雨スープ', price: 800, category: 'noodle', popular: true,
    description: '春雨と鶏もみじ、きのこの旨みを重ねた、体が温まるミャンマー風スープ。',
    image: '/glass-noodle-soup.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:300}],
    toppings: [{id:'vermicelli',label:'ကြာဆံအပို / 春雨追加',price:150},{id:'chicken-feet',label:'ကြက်ခြေထောက်အပို / 鶏もみじ追加',price:250},{id:'egg',label:'ကြက်ဥ / 卵',price:150},{id:'mushroom',label:'မှိုအပို / きのこ追加',price:150},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 23, mm: 'ရှမ်းတိုဖူးသုပ်', jp: 'シャン豆腐サラダ', price: 650, category: 'salad', popular: true,
    description: 'なめらかなシャン豆腐を香味野菜と和えた、香ばしく爽やかなサラダ。',
    image: '/shan-tofu-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'shan-tofu',label:'ရှမ်းတိုဖူးအပို / シャン豆腐追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 24, mm: 'ပေါက်စီ', jp: 'ミャンマー風肉まん', price: 350, category: 'snack', popular: true,
    description: 'ふんわり蒸した生地で選べる具材を包んだ、ミャンマーで親しまれる肉まん。',
    image: '/myanmar-steamed-bun.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'one', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'one',label:'၁ လုံး / 1個',price:0},{id:'two',label:'၂ လုံး / 2個',price:300},{id:'three',label:'၃ လုံး / 3個',price:550}],
    secondaryTitle: 'အဆာရွေးပါ / 具材を選択', defaultSecondary: 'chicken',
    secondaryOptions: [{id:'chicken',label:'ကြက်သား / 鶏肉',price:0},{id:'pork',label:'ဝက်သား / 豚肉',price:0},{id:'vegetable',label:'ဟင်းသီးဟင်းရွက် / 野菜',price:0}],
    toppings: [{id:'egg-filling',label:'ကြက်ဥအဆာ / 卵入り',price:100},{id:'extra-meat',label:'အသားအပို / 肉増量',price:150},{id:'chili-sauce',label:'ချီလီဆော့စ် / チリソース',price:50}] },
  { id: 25, mm: 'အီကြာကွေး', jp: '揚げパン（油条）', price: 400, category: 'snack', popular: true,
    description: '外はさっくり、中はふんわり。朝食やスープのお供に人気の揚げパン。',
    image: '/fried-bread.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 本数を選択', defaultOption: 'two', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'two',label:'၂ ချောင်း / 2本',price:0},{id:'four',label:'၄ ချောင်း / 4本',price:300},{id:'six',label:'၆ ချောင်း / 6本',price:550}],
    secondaryTitle: 'စားသုံးပုံရွေးပါ / 食べ方を選択', defaultSecondary: 'plain',
    secondaryOptions: [{id:'plain',label:'ရိုးရိုး / そのまま',price:0},{id:'condensed-milk',label:'နို့ဆီနှင့် / 練乳付き',price:100},{id:'bean-curry',label:'ပဲဟင်းနှင့် / 豆カレー付き',price:200}],
    toppings: [{id:'condensed-milk',label:'နို့ဆီအပို / 練乳追加',price:100},{id:'sugar',label:'သကြား / 砂糖',price:50},{id:'bean-curry',label:'ပဲဟင်းအပို / 豆カレー追加',price:200}] },
  { id: 26, mm: 'အချိုလက်ဖက်သုပ်', jp: '甘口ラペットゥ', price: 700, category: 'salad', popular: true,
    description: '発酵茶葉の風味をやさしい味わいに仕上げた、辛さ控えめのラペットゥ。',
    image: '/sweet-lahpet-thoke.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'none',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:450}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 27, mm: 'လက်ဖက်အစုံသုပ်', jp: 'ミックス・ラペットゥ', price: 800, category: 'salad', popular: true,
    description: '発酵茶葉に豆、干しエビ、野菜を合わせた、食感豊かなミックスサラダ。',
    image: '/mixed-lahpet-thoke.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:500}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100}] },
  { id: 28, mm: 'လက်ဖက်ထမင်း', jp: 'ラペッタミン', price: 850, category: 'curry', popular: true,
    description: '発酵茶葉の香りをご飯に混ぜ込み、豆や香味素材を合わせたミャンマーの茶葉ごはん。',
    image: '/lahpet-rice.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large-rice',label:'ထမင်းအကြီး / ご飯大盛り',price:200}],
    secondaryTitle: 'ကြက်ဥရွေးပါ / 卵を選択', defaultSecondary: 'no-egg',
    secondaryOptions: [{id:'no-egg',label:'ကြက်ဥမပါ / 卵なし',price:0},{id:'fried-egg',label:'ကြက်ဥကြော် / 目玉焼き',price:150},{id:'boiled-egg',label:'ကြက်ဥပြုတ် / ゆで卵',price:150}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100},{id:'rice',label:'ထမင်းအပို / ライス追加',price:200}] },
  { id: 29, mm: 'ရခိုင်သုပ်', jp: 'ラカイン風ライスヌードルサラダ', price: 750, category: 'salad', popular: true,
    description: '魚の旨みと香味野菜を米麺に絡めた、爽やかな辛さのラカイン風サラダ。',
    image: '/rakhine-rice-noodle-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'normal',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:250}],
    toppings: [{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150},{id:'fish-ball',label:'ငါးဖယ်အပို / 魚団子追加',price:200},{id:'onion',label:'ကြက်သွန်နီအပို / 玉ねぎ追加',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 30, mm: 'ရွှေထမင်း', jp: 'シュエタミン', price: 550, category: 'dessert', popular: true,
    description: 'もち米をココナッツと甘く炊き上げた、もっちり香ばしいミャンマー菓子。',
    image: '/shwe-htamin.webp', optionTitle: 'ပမာဏရွေးပါ / 個数を選択', defaultOption: 'four', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'four',label:'၄ တုံး / 4個',price:0},{id:'six',label:'၆ တုံး / 6個',price:200},{id:'eight',label:'၈ တုံး / 8個',price:350}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 31, mm: 'မုန့်သိုင်းခြုံ', jp: 'モン・タイン・チョン', price: 600, category: 'dessert', popular: true,
    description: '薄く焼いた生地でココナッツや豆あんを包む、やさしい甘さの伝統菓子。',
    image: '/mont-thaing-chon.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'two', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'two',label:'၂ ခု / 2個',price:0},{id:'four',label:'၄ ခု / 4個',price:350},{id:'six',label:'၆ ခု / 6個',price:650}],
    secondaryTitle: 'အဆာရွေးပါ / 中身を選択', defaultSecondary: 'coconut',
    secondaryOptions: [{id:'coconut',label:'အုန်းသီးအဆာ / ココナッツ',price:0},{id:'coconut-palm',label:'အုန်းသီးနှင့်ထန်းလျက် / ココナッツ＆パームシュガー',price:0},{id:'bean',label:'ပဲအဆာ / 豆あん',price:0}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ်အပို / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 32, mm: 'မုန့်လက်ဆောင်း', jp: 'モン・レット・サウン', price: 500, category: 'drink', popular: true,
    description: 'カラフルなタピオカとパンダンゼリーをココナッツミルクで楽しむ、涼やかなミャンマーデザート。',
    image: '/mont-let-saung.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'none',label:'ရေခဲမပါ / なし',price:0},{id:'less',label:'ရေခဲနည်း / 少なめ',price:0},{id:'normal',label:'ပုံမှန် / 普通',price:0}],
    toppings: [{id:'color-tapioca',label:'ရောင်စုံသာကူ / カラフルタピオカ',price:50},{id:'pandan-jelly',label:'ပန်ဒန်ကျောက်ကျော / パンダンゼリー',price:50},{id:'coconut-milk',label:'အုန်းနို့အပို / ココナッツミルク追加',price:50}] },
  { id: 33, mm: 'မုန့်ကျွဲသည်း', jp: 'モン・チュエテー', price: 500, category: 'dessert', popular: true,
    description: '黒糖の深い甘みともっちりした食感を楽しむ、素朴なミャンマー伝統菓子。',
    image: '/mont-kywe-the.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'five', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'five',label:'၅ တုံး / 5個',price:0},{id:'eight',label:'၈ တုံး / 8個',price:250},{id:'twelve',label:'၁၂ တုံး / 12個',price:500}],
    toppings: [{id:'poppy',label:'ဘိန်းစေ့အပို / けしの実追加',price:50},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 34, mm: 'ဆနွင်းမကင်း', jp: 'ミャンマー風セモリナケーキ', price: 550, category: 'dessert', popular: true,
    description: 'セモリナとココナッツの濃厚な風味を楽しむ、しっとりしたミャンマーケーキ。',
    image: '/semolina-cake.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'two', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'two',label:'၂ တုံး / 2個',price:0},{id:'four',label:'၄ တုံး / 4個',price:300},{id:'six',label:'၆ တုံး / 6個',price:550}],
    toppings: [{id:'poppy',label:'ဘိန်းစေ့အပို / けしの実追加',price:50},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50}] },
  { id: 35, mm: 'ထိုးမုန့်', jp: 'トーモン', price: 550, category: 'dessert', popular: true,
    description: 'ココナッツの香りともちもち食感が広がる、ひと口サイズのミャンマー菓子。',
    image: '/toh-mont.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'three', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'three',label:'၃ တုံး / 3個',price:0},{id:'six',label:'၆ တုံး / 6個',price:300},{id:'nine',label:'၉ တုံး / 9個',price:550}],
    toppings: [{id:'roasted-coconut',label:'အုန်းသီးကြော်အပို / ローストココナッツ追加',price:100},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50}] },
  { id: 36, mm: 'သင်္ဘောသီးထောင်း', jp: '青パパイヤサラダ', price: 700, category: 'salad', popular: true,
    description: '青パパイヤの歯ざわりとライムの酸味を生かした、爽快なピリ辛サラダ。',
    image: '/green-papaya-salad.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'normal',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:450}],
    toppings: [{id:'papaya',label:'သင်္ဘောသီးအပို / 青パパイヤ追加',price:150},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'green-bean',label:'ပဲတောင့်ရှည်အပို / インゲン追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'lime',label:'သံပရာအပို / ライム追加',price:100}] },
  { id: 37, mm: 'တိုဖူးကြော်', jp: '揚げシャン豆腐', price: 600, category: 'snack', popular: true,
    description: '外はカリッと中はなめらか。シャン豆腐を香ばしく揚げた人気のおつまみ。',
    image: '/fried-shan-tofu.webp', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'small', defaultSpice: 'mild',
    options: [{id:'small',label:'အသေး / 小',price:0},{id:'large',label:'အကြီး / 大',price:300}],
    secondaryTitle: 'ဆော့စ်ရွေးပါ / ソースを選択', defaultSecondary: 'sweet-spicy',
    secondaryOptions: [{id:'sweet-spicy',label:'ချဉ်စပ်ဆော့စ် / 甘酸っぱいピリ辛ソース',price:0},{id:'sweet',label:'အချိုဆော့စ် / スイートソース',price:0},{id:'none',label:'ဆော့စ်မပါ / ソースなし',price:0}],
    toppings: [{id:'fried-tofu',label:'တိုဖူးကြော်အပို / 揚げ豆腐追加',price:200},{id:'sauce',label:'ဆော့စ်အပို / ソース追加',price:100},{id:'peanut-powder',label:'မြေပဲအမှုန့် / ピーナッツパウダー',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 38, mm: 'စတော်ဘယ်ရီဂျယ်လီဖျော်ရည်', jp: 'ストロベリーゼリードリンク', price: 550, category: 'drink', popular: true,
    description: 'ストロベリーゼリーをミルクと合わせた、ひんやり甘く華やかなデザートドリンク。',
    image: '/falooda.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'none',label:'ရေခဲမပါ / なし',price:0},{id:'less',label:'ရေခဲနည်း / 少なめ',price:0},{id:'normal',label:'ပုံမှန် / 普通',price:0}],
    toppings: [{id:'strawberry-jelly',label:'စတော်ဘယ်ရီဂျယ်လီအပို / ストロベリーゼリー追加',price:50},{id:'milk',label:'နို့အပို / ミルク追加',price:50},{id:'tapioca',label:'သာကူ / タピオカ',price:70}] },
  { id: 39, mm: 'ကျောက်ကျော', jp: 'パンダンとココナッツの二層ゼリー', price: 450, category: 'dessert', popular: true,
    description: 'パンダンの爽やかな香りとココナッツのまろやかさを重ねた、色鮮やかな二層ゼリー。',
    image: '/pandan-coconut-jelly.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'three', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'}],
    options: [{id:'three',label:'၃ ခု / 3個',price:0},{id:'five',label:'၅ ခု / 5個',price:150}],
    toppings: [{id:'coconut-flake',label:'အုန်းသီးဖတ် / ココナッツフレーク',price:50},{id:'coconut-sauce',label:'အုန်းနို့ဆော့စ် / ココナッツミルクソース',price:50}] },
  { id: 40, mm: 'အာလူးဆနွမ်းမကင်း', jp: 'ミャンマー風ポテトケーキ', price: 450, category: 'dessert', popular: true,
    description: 'じゃがいものやさしい甘さと香ばしいごまを楽しむ、しっとり食感のミャンマー風ケーキ。',
    image: '/myanmar-potato-cake.webp', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'one', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'one',label:'၁ ခု / 1個',price:0},{id:'two',label:'၂ ခု / 2個',price:350}],
    secondaryTitle: 'နွေးပုံရွေးပါ / 温め方を選択', defaultSecondary: 'as-is',
    secondaryOptions: [{id:'as-is',label:'ဒီအတိုင်း / そのまま',price:0},{id:'warm',label:'နွေးပေးပါ / 温める',price:0}],
    toppings: [{id:'raisin',label:'စပျစ်သီးခြောက်အပို / レーズン追加',price:50},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:30},{id:'coconut-flake',label:'အုန်းသီးဖတ် / ココナッツフレーク',price:50}] },
  { id: 41, mm: 'ကြံရည်', jp: 'サトウキビジュース', price: 400, category: 'drink', popular: true,
    description: '搾りたてのサトウキビの自然な甘さを楽しむ、すっきり爽やかなジュース。',
    image: '/sugarcane-juice.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'natural', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'natural',label:'ဒီအတိုင်း / そのまま'},{id:'less',label:'အချိုလျှော့ / 控えめ'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'none',label:'ရေခဲမပါ / なし',price:0},{id:'less',label:'ရေခဲနည်း / 少なめ',price:0},{id:'normal',label:'ပုံမှန် / 普通',price:0}],
    toppings: [{id:'lemon',label:'သံပုရာ / レモン',price:50},{id:'lime',label:'သံပရာ / ライム',price:50},{id:'ginger',label:'ဂျင်း / ショウガ',price:50}] },
  { id: 42, mm: 'သံပုရာရည်', jp: 'レモンジュース', price: 400, category: 'drink', popular: true,
    description: 'レモンの爽やかな酸味を生かした、すっきり飲みやすいフレッシュジュース。',
    image: '/lemon-juice.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'none',label:'ရေခဲမပါ / なし',price:0},{id:'less',label:'ရေခဲနည်း / 少なめ',price:0},{id:'normal',label:'ပုံမှန် / 普通',price:0}],
    toppings: [{id:'honey',label:'ပျားရည် / はちみつ',price:50},{id:'mint',label:'ပူဒီနာ / ミント',price:30},{id:'lemon',label:'သံပုရာအပို / レモン追加',price:50}] },
  { id: 43, mm: 'မန်ကျည်းဖျော်ရည်', jp: 'タマリンドジュース', price: 450, category: 'drink', popular: true,
    description: 'タマリンドの甘酸っぱさと深いコクを楽しむ、ミャンマーで親しまれる爽やかなジュース。',
    image: '/tamarind-juice.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'none',label:'ရေခဲမပါ / なし',price:0},{id:'less',label:'ရေခဲနည်း / 少なめ',price:0},{id:'normal',label:'ပုံမှန် / 普通',price:0}],
    toppings: [{id:'lemon',label:'သံပုရာ / レモン',price:50},{id:'mint',label:'ပူဒီနာ / ミント',price:30},{id:'tamarind-pulp',label:'မန်ကျည်းသား / タマリンド果肉',price:50}] },
  { id: 44, mm: 'ရေနွေးကြမ်း', jp: 'ミャンマー風温かいお茶', price: 200, category: 'drink', popular: true,
    description: '食事に寄り添う、香り穏やかですっきりした味わいのミャンマー風温かいお茶。',
    image: '/myanmar-hot-tea.webp', optionTitle: 'ပမာဏရွေးပါ / サイズを選択', defaultOption: 'cup', defaultSpice: 'normal', spiceTitle: 'အရသာပြင်းအားရွေးပါ / 濃さを選択',
    flavors: [{id:'light',label:'ပေါ့ပေါ့ / 薄め'},{id:'normal',label:'ပုံမှန် / 普通'},{id:'strong',label:'ပြင်းပြင်း / 濃いめ'}],
    options: [{id:'cup',label:'၁ ခွက် / 1杯',price:0},{id:'pot',label:'လက်ဖက်ရည်အိုး / ポット',price:200}],
    secondaryTitle: 'အပူချိန်ရွေးပါ / 温度を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'normal',label:'ပုံမှန် / 普通',price:0},{id:'hot',label:'ပိုပူ / 熱め',price:0}],
    toppings: [{id:'sugar',label:'သကြား / 砂糖',price:0},{id:'lemon',label:'သံပုရာ / レモン',price:50},{id:'honey',label:'ပျားရည် / はちみつ',price:50}] },
  { id: 45, mm: 'လက်ဖက်ရည်', jp: 'ミャンマー風ミルクティー', price: 400, category: 'drink', popular: true,
    description: '濃く抽出した紅茶にミルクを合わせた、コク深くまろやかなミャンマー風ミルクティー。',
    image: '/myanmar-milk-tea.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'အပူချိန်ရွေးပါ / 温度を選択', defaultSecondary: 'hot',
    secondaryOptions: [{id:'hot',label:'အပူ / ホット',price:0},{id:'iced',label:'အအေး / アイス',price:0}],
    toppings: [{id:'condensed-milk',label:'နို့ဆီအပို / 練乳追加',price:50},{id:'milk',label:'နို့အပို / ミルク追加',price:50},{id:'tapioca',label:'သာကူ / タピオカ',price:70}] },
  { id: 46, mm: 'သာကူကြို', jp: 'サゴ入りココナッツミルクデザート', price: 500, category: 'drink', popular: true,
    description: 'もちもちのサゴをココナッツミルクで仕上げた、温かくても冷たくても楽しめるデザート。',
    image: '/sago-coconut-dessert.webp', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'm', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 控えめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'m',label:'M',price:0},{id:'l',label:'L',price:100}],
    secondaryTitle: 'အပူချိန်ရွေးပါ / 温度を選択', defaultSecondary: 'warm',
    secondaryOptions: [{id:'warm',label:'အပူ / 温かい',price:0},{id:'cold',label:'အအေး / 冷たい',price:0}],
    toppings: [{id:'coconut-flake',label:'အုန်းသီးဖတ် / ココナッツフレーク',price:50},{id:'coconut-milk',label:'အုန်းနို့အပို / ココナッツミルク追加',price:50},{id:'jelly',label:'ကျောက်ကျော / ゼリー',price:50}] },
  { id: 47, mm: 'မိသားစု စနေတနင်္ဂနွေ အထူးအစုံ', jp: '週末ファミリーセット', price: 3800, category: 'curry', popular: true, special: true,
    description: 'お好きなカレー・おかずを2品選べる、ライス4人前・豆とキャベツのサラダ・ミャンマー茶（ポット）付きのお得なセット。3〜4名様向けです。',
    image: '/family-set.webp', optionTitle: 'セット内容 / セットサイズ', defaultOption: 'family', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'family',label:'မိသားစုအစုံ / ファミリーセット（3〜4名様）',price:0}],
    multiTitle: 'အဓိကဟင်း ၂ မျိုးရွေးပါ / カレー・おかずを2品選択', selectionLimit: {family:2},
    multiOptions: [{id:'chicken-curry',label:'မြန်မာကြက်သားဟင်း / ミャンマー風チキンカレー'},{id:'fish-curry',label:'မြန်မာငါးဟင်း / ミャンマー風魚カレー'},{id:'liver-cauliflower',label:'အသည်းပန်းဂေါ်ဖီကြော် / レバーとカリフラワー炒め'},{id:'bitter-melon-egg',label:'ကြက်ဟင်းခါးသီးကြက်ဥကြော် / ゴーヤと卵炒め'},{id:'ngapi-platter',label:'ငပိရည်ကြိုတို့စရာဗန်း / 発酵魚ディップと野菜'},{id:'spicy-dried-fish',label:'အစပ်ငါးခြောက်ကြော် / ピリ辛干し魚炒め'}],
    toppings: [] },
] as Food[]).map((food) => ({
  ...food,
  image: food.image ? sitePath(food.image) : '',
}));

const yen = (value: number) => '¥' + value.toLocaleString('ja-JP');
const createOrderId = () => 'HM-' + String(Date.now()).slice(-6);
const vegetarianIds = new Set([13,18,20,21,23,30,31,32,33,34,35,37,39,40]);
const beginnerIds = new Set([1,2,4,7,9,10,18,20,21,24,38,45]);
const popularMenuIds = new Set([1,2,4,7,9,10,18,21,27,45]);
const tasteOf = (food: Food, language: 'jp' | 'mm' = 'jp') => {
  if (language === 'mm') {
    return food.category === 'dessert' || food.category === 'drink' ? 'ချိုမြိန်နူးညံ့' : food.defaultSpice === 'none' ? 'အရသာနူးညံ့' : food.id === 19 || food.id === 36 ? 'ချဉ်စပ်' : 'မွှေးကြိုင်ပြီး အနည်းငယ်စပ်';
  }
  return food.category === 'dessert' || food.category === 'drink' ? 'やさしい甘さ' : food.defaultSpice === 'none' ? 'まろやか' : food.id === 19 || food.id === 36 ? '酸味・ピリ辛' : '香ばしい・ピリ辛';
};
const allergyOf = (food: Food, language: 'jp' | 'mm' = 'jp') => {
  const labels: string[] = [];
  if ([1,4,5,7,9,13,16,20,24,31,34,38,39,40,45,46].includes(food.id)) labels.push('卵');
  if ([4,16,20,31,32,34,35,38,39,40,45,46].includes(food.id)) labels.push('乳');
  if ([1,4,16,21,24,25,31,34,35,40].includes(food.id)) labels.push('小麦');
  if ([2,3,7,8,16,17,18,19,23,26,27,28,29,36,37].includes(food.id)) labels.push('落花生');
  if ([17,19,27,36].includes(food.id)) labels.push('えび');
  if ([1,8,11,14,15,36].includes(food.id)) labels.push('魚');
  if (!labels.length) return language === 'mm' ? 'ဆိုင်သို့ မေးမြန်းပါ' : '店舗へご確認ください';
  if (language === 'jp') return labels.join('・');
  const mmLabels: Record<string, string> = { 卵:'ဥ', 乳:'နို့', 小麦:'ဂျုံ', 落花生:'မြေပဲ', えび:'ပုစွန်', 魚:'ငါး' };
  return labels.map((label) => mmLabels[label]).join('・');
};

const uiText = {
  jp: {
    deliveryDestination:'お届け先', guest:'Guest', orderInfo:'注文情報', search:'検索', viewMenu:'メニューを見る', recommendation:'今日のおすすめ診断',
    delivery:'配達', pickup:'店頭受取', accepting:'ただいま注文受付中', freeDelivery:'¥2,000以上で配送料無料', categories:'カテゴリー', viewAll:'すべて見る', favorites:'お気に入り',
    recommendedOrder:'おすすめ順', filter:'絞り込み', popular:'人気', beginner:'初めてにおすすめ', vegetarian:'ベジタリアン', choose:'選ぶ', noFood:'料理が見つかりません', clearSearch:'検索をクリア',
    hours:'営業時間 11:00–22:00', staffManagement:'スタッフ・店舗管理', home:'ホーム', menu:'メニュー', cart:'カート', order:'注文',
    foodDetail:'FOOD DETAIL', taste:'味の特徴', spicyLevel:'辛さレベル', allergy:'アレルギー', required:'必須', optional:'任意', toppings:'追加トッピング', request:'特別なご要望', requestSub:'ご要望・備考', quantity:'数量', saveChanges:'変更を保存', addCart:'カートに追加', requiredWarning:'必須項目を選択してください',
    yourOrder:'YOUR ORDER', items:'点', note:'備考', edit:'内容を編集', delete:'削除', coupon:'クーポンコード', apply:'適用', storeMemo:'お店へのメモ（任意）', subtotal:'小計', deliveryFee:'配送料', checkoutCalc:'Checkoutで計算', productTotal:'商品合計', taxIncluded:'税込', proceedCheckout:'レジに進む', emptyCart:'カートは空です', chooseFood:'お好きな料理を選んでください。',
    checkout:'CHECKOUT', deliveryInfo:'お届け情報', receiveMethod:'受け取り方法', deliveryToAddress:'ご指定の住所へ', pickupAtStore:'お店で受け取り', customerInfo:'お客様情報', nameRequired:'お名前（必須）', phoneRequired:'電話番号（必須）', addressRequired:'配達先住所（必須）', receiveTime:'受取時間', asap:'できるだけ早く', schedule:'時間指定', remarks:'備考欄（任意）', remarksPlaceholder:'アレルギーや受け取りについてのご要望', payment:'お支払い', cash:'現金', card:'カード', cardNumber:'カード番号（必須）', expiry:'有効期限', paypayHelp:'注文内容を確認した後、PayPayでのお支払い案内を表示します。', paymentTotal:'お支払い合計', reviewOrder:'注文内容を確認', notConfirmed:'このボタンではまだ注文は確定しません',
    finalReview:'FINAL REVIEW', finalTitle:'注文内容の最終確認', finalHelp:'内容をご確認のうえ、注文を確定してください。', orderItems:'ご注文', receiveInfo:'受け取り情報', method:'方法', address:'住所', name:'お名前', phone:'電話番号', backEdit:'戻って修正', placeOrder:'この内容で注文する', orderComplete:'注文が完了しました', thanks:'ご注文ありがとうございます', total:'合計', backHome:'ホームに戻る',
    recommendTitle:'今日のおすすめ診断', recommendHelp:'気分に近いものを選んでください。', whatEat:'何を食べたいですか？', riceCurry:'ご飯・カレー', noodles:'麺料理', likeSpicy:'辛いものは好きですか？', yes:'はい', no:'いいえ', yourRecommendation:'あなたへのおすすめ', seeDish:'この料理を見る', orderHistory:'注文履歴', noHistory:'注文履歴はまだありません。',
    guestOrder:'ゲスト注文', guestHelp:'登録・パスワードなしでご利用いただけます', deliveryAddress:'配達先住所', orderStatus:'注文状況', noOrder:'注文はまだありません', paymentMethod:'支払い方法', languageSetting:'言語設定', backOrderInfo:'注文情報に戻る', saveAddress:'住所を保存', savePayment:'支払い方法を保存',
    found:'件見つかりました', allMenu:'全メニュー', filterTitle:'メニューを絞り込む', priceRange:'価格帯', excludedAllergy:'除外するアレルギー', reset:'リセット', showResults:'結果を見る', discount:'クーポン割引', free:'無料', demoPayment:'デモ決済（実際の請求はありません）', demoDisplay:'デモ表示', trackingTitle:'注文状況', accepted:'受付', cooking:'調理中', delivering:'配達中', readyPickup:'受取待ち', completed:'完了', locationTitle:'お届け先・配達範囲', notificationTitle:'お知らせ', legal:'特定商取引法に基づく表記', privacy:'プライバシーポリシー', cancellation:'キャンセルポリシー', storeInfo:'営業時間・配達条件'
  },
  mm: {
    deliveryDestination:'ပို့ဆောင်မည့်နေရာ', guest:'ဧည့်သည်', orderInfo:'မှာယူမှုအချက်အလက်', search:'ရှာရန်', viewMenu:'မီနူးကြည့်ရန်', recommendation:'ဒီနေ့အတွက် အကြံပြုမီနူး',
    delivery:'ပို့ဆောင်ရန်', pickup:'ဆိုင်တွင်ယူရန်', accepting:'ယခု အော်ဒါလက်ခံနေပါသည်', freeDelivery:'¥2,000 နှင့်အထက် ပို့ခအခမဲ့', categories:'အမျိုးအစားများ', viewAll:'အားလုံးကြည့်ရန်', favorites:'အကြိုက်ဆုံးများ',
    recommendedOrder:'အကြံပြုအစဉ်', filter:'စစ်ထုတ်ရန်', popular:'လူကြိုက်များ', beginner:'စတင်စားသူများအတွက်', vegetarian:'သက်သတ်လွတ်', choose:'ရွေးရန်', noFood:'အစားအစာမတွေ့ပါ', clearSearch:'ရှာဖွေမှုရှင်းရန်',
    hours:'ဆိုင်ဖွင့်ချိန် 11:00–22:00', staffManagement:'ဝန်ထမ်းနှင့် ဆိုင်စီမံခန့်ခွဲမှု', home:'ပင်မ', menu:'မီနူး', cart:'ခြင်း', order:'မှာယူမှု',
    foodDetail:'အစားအသောက်အသေးစိတ်', taste:'အရသာလက္ခဏာ', spicyLevel:'အစပ်အဆင့်', allergy:'ဓာတ်မတည့်မှု', required:'မဖြစ်မနေ', optional:'ရွေးချယ်နိုင်', toppings:'Topping ထပ်ထည့်ရန်', request:'အထူးတောင်းဆိုချက်', requestSub:'တောင်းဆိုချက်နှင့် မှတ်ချက်', quantity:'အရေအတွက်', saveChanges:'ပြင်ဆင်မှုသိမ်းရန်', addCart:'ခြင်းထဲထည့်ရန်', requiredWarning:'မဖြစ်မနေအချက်များကို ရွေးပါ',
    yourOrder:'သင့်မှာယူမှု', items:'ခု', note:'မှတ်ချက်', edit:'ပြင်ဆင်ရန်', delete:'ဖျက်ရန်', coupon:'ကူပွန်ကုဒ်', apply:'အသုံးပြုရန်', storeMemo:'ဆိုင်သို့မှတ်ချက် (ရွေးချယ်နိုင်)', subtotal:'ပစ္စည်းစုစုပေါင်း', deliveryFee:'ပို့ဆောင်ခ', checkoutCalc:'ငွေရှင်းချိန်တွင် တွက်မည်', productTotal:'ကုန်ပစ္စည်းစုစုပေါင်း', taxIncluded:'အခွန်ပါ', proceedCheckout:'ငွေရှင်းရန်', emptyCart:'ခြင်းထဲတွင် ပစ္စည်းမရှိပါ', chooseFood:'ကြိုက်နှစ်သက်သောအစားအစာကို ရွေးပါ။',
    checkout:'ငွေရှင်းခြင်း', deliveryInfo:'လက်ခံမည့်အချက်အလက်', receiveMethod:'လက်ခံမည့်နည်းလမ်း', deliveryToAddress:'သတ်မှတ်လိပ်စာသို့ ပို့မည်', pickupAtStore:'ဆိုင်တွင် လာယူမည်', customerInfo:'ဖောက်သည်အချက်အလက်', nameRequired:'အမည် (မဖြစ်မနေ)', phoneRequired:'ဖုန်းနံပါတ် (မဖြစ်မနေ)', addressRequired:'ပို့ဆောင်မည့်လိပ်စာ (မဖြစ်မနေ)', receiveTime:'လက်ခံမည့်အချိန်', asap:'အမြန်ဆုံး', schedule:'အချိန်သတ်မှတ်ရန်', remarks:'မှတ်ချက် (ရွေးချယ်နိုင်)', remarksPlaceholder:'ဓာတ်မတည့်မှု သို့မဟုတ် လက်ခံမှုဆိုင်ရာ တောင်းဆိုချက်', payment:'ငွေပေးချေမှု', cash:'ငွေသား', card:'ကတ်', cardNumber:'ကတ်နံပါတ် (မဖြစ်မနေ)', expiry:'သက်တမ်းကုန်ရက်', paypayHelp:'အော်ဒါကိုအတည်ပြုပြီးနောက် PayPay ပေးချေမှုလမ်းညွှန်ကို ပြပါမည်။', paymentTotal:'ပေးချေရမည့်စုစုပေါင်း', reviewOrder:'မှာယူမှုကို စစ်ဆေးရန်', notConfirmed:'ဤခလုတ်ဖြင့် အော်ဒါမပြီးသေးပါ',
    finalReview:'နောက်ဆုံးစစ်ဆေးခြင်း', finalTitle:'မှာယူမှု နောက်ဆုံးအတည်ပြုချက်', finalHelp:'အချက်အလက်များကို စစ်ဆေးပြီး အော်ဒါအတည်ပြုပါ။', orderItems:'မှာယူထားသောပစ္စည်းများ', receiveInfo:'လက်ခံမှုအချက်အလက်', method:'နည်းလမ်း', address:'လိပ်စာ', name:'အမည်', phone:'ဖုန်းနံပါတ်', backEdit:'ပြန်ပြင်ရန်', placeOrder:'ဤအတိုင်း မှာယူရန်', orderComplete:'မှာယူမှု ပြီးဆုံးပါပြီ', thanks:'မှာယူပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်', total:'စုစုပေါင်း', backHome:'ပင်မသို့ပြန်ရန်',
    recommendTitle:'ဒီနေ့အတွက် အကြံပြုမီနူး', recommendHelp:'သင်စားချင်သည့်ပုံစံကို ရွေးပါ။', whatEat:'ဘာစားချင်ပါသလဲ?', riceCurry:'ထမင်းနှင့် ဟင်း', noodles:'ခေါက်ဆွဲ', likeSpicy:'အစပ်ကြိုက်ပါသလား?', yes:'ကြိုက်သည်', no:'မကြိုက်ပါ', yourRecommendation:'သင့်အတွက် အကြံပြုမီနူး', seeDish:'ဒီမီနူးကို ကြည့်ရန်', orderHistory:'မှာယူမှုမှတ်တမ်း', noHistory:'မှာယူမှုမှတ်တမ်း မရှိသေးပါ။',
    guestOrder:'ဧည့်သည်မှာယူမှု', guestHelp:'စာရင်းသွင်းခြင်းနှင့် စကားဝှက်မလိုပါ', deliveryAddress:'ပို့ဆောင်မည့်လိပ်စာ', orderStatus:'မှာယူမှုအခြေအနေ', noOrder:'မှာယူမှု မရှိသေးပါ', paymentMethod:'ငွေပေးချေနည်း', languageSetting:'ဘာသာစကား', backOrderInfo:'မှာယူမှုအချက်အလက်သို့ ပြန်ရန်', saveAddress:'လိပ်စာသိမ်းရန်', savePayment:'ငွေပေးချေနည်း သိမ်းရန်',
    found:'ခု တွေ့ရှိပါသည်', allMenu:'မီနူးအားလုံး', filterTitle:'မီနူးစစ်ထုတ်ရန်', priceRange:'ဈေးနှုန်း', excludedAllergy:'ဖယ်ရှားလိုသော ဓာတ်မတည့်မှု', reset:'ပြန်လည်သတ်မှတ်ရန်', showResults:'ရလဒ်ကြည့်ရန်', discount:'ကူပွန်လျှော့ဈေး', free:'အခမဲ့', demoPayment:'စမ်းသပ်ငွေပေးချေမှု (အမှန်တကယ်ငွေမဖြတ်ပါ)', demoDisplay:'စမ်းသပ်ဒေတာ', trackingTitle:'မှာယူမှုအခြေအနေ', accepted:'လက်ခံပြီး', cooking:'ချက်ပြုတ်နေသည်', delivering:'ပို့ဆောင်နေသည်', readyPickup:'လာယူနိုင်ပါပြီ', completed:'ပြီးဆုံး', locationTitle:'ပို့ဆောင်မည့်နေရာနှင့် ဧရိယာ', notificationTitle:'အသိပေးချက်များ', legal:'အရောင်းအဝယ်ဥပဒေဆိုင်ရာ အချက်အလက်', privacy:'ကိုယ်ရေးအချက်အလက် မူဝါဒ', cancellation:'ပယ်ဖျက်ခြင်း မူဝါဒ', storeInfo:'ဆိုင်ချိန်နှင့် ပို့ဆောင်မှုအချက်အလက်'
  }
} as const;

export default function Home() {
  const [language, setLanguage] = useState<'jp' | 'mm'>('jp');
  const [activeTab, setActiveTab] = useState('home');
  const [category, setCategory] = useState('popular');
  const [query, setQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterPrice, setFilterPrice] = useState<FilterPrice>('all');
  const [filterSpice, setFilterSpice] = useState<FilterSpice>('all');
  const [filterAllergy, setFilterAllergy] = useState('all');
  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selected, setSelected] = useState<Food | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailOption, setDetailOption] = useState<string | null>(null);
  const [detailSpice, setDetailSpice] = useState<string | null>(null);
  const [detailSecondary, setDetailSecondary] = useState<string | null>(null);
  const [detailMulti, setDetailMulti] = useState<string[]>([]);
  const [detailToppings, setDetailToppings] = useState<string[]>([]);
  const [detailNote, setDetailNote] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [checkoutReview, setCheckoutReview] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [showRecommend, setShowRecommend] = useState(false);
  const [recommendType, setRecommendType] = useState<'curry' | 'noodle' | null>(null);
  const [recommendSpicy, setRecommendSpicy] = useState<boolean | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ name:'', phone:'', address:'', timing:'asap', scheduled:'', payment:'cash', note:'', cardNumber:'', expiry:'', cvc:'' });
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [profilePanel, setProfilePanel] = useState<'address' | 'payment' | null>(null);
  const [infoPanel, setInfoPanel] = useState<'location' | 'notifications' | 'legal' | 'privacy' | 'cancellation' | 'store' | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [toast, setToast] = useState('');
  const t = (key: keyof typeof uiText.jp) => uiText[language][key];

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem('home-myanmar-cart');
      const savedOrders = window.localStorage.getItem('home-myanmar-orders');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedOrders) setOrders((JSON.parse(savedOrders) as Partial<OrderRecord>[]).map((order) => ({ ...order, status:order.status || '受付', payment:order.payment || 'cash', subtotal:order.subtotal ?? order.total ?? 0, deliveryFee:order.deliveryFee ?? 0, discount:order.discount ?? 0 } as OrderRecord)));
    } catch { /* corrupted device data is ignored */ }
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (cartReady) window.localStorage.setItem('home-myanmar-cart', JSON.stringify(cart));
  }, [cart, cartReady]);
  useEffect(() => {
    if (cartReady) window.localStorage.setItem('home-myanmar-orders', JSON.stringify(orders));
  }, [orders, cartReady]);
  useEffect(() => {
    const syncOrders = (event: StorageEvent) => {
      if (event.key !== 'home-myanmar-orders' || !event.newValue) return;
      try { setOrders(JSON.parse(event.newValue)); } catch { /* ignore invalid demo data */ }
    };
    window.addEventListener('storage', syncOrders);
    return () => window.removeEventListener('storage', syncOrders);
  }, []);
  useEffect(() => {
    if (!completedOrder) return;
    const updated = orders.find((order) => order.id === completedOrder.id);
    if (updated && updated.status !== completedOrder.status) setCompletedOrder(updated);
  }, [orders, completedOrder]);

  const filteredFoods = useMemo(() => {
    let list = favoritesOnly ? foods.filter((food) => favorites.includes(food.id)) : category === 'all' ? foods.filter((food) => food.id !== 47) : category === 'popular' ? foods.filter((food) => popularMenuIds.has(food.id)) : foods.filter((food) => food.category === category);
    const q = query.toLowerCase();
    if (q.trim()) list = list.filter((food) => (food.jp + ' ' + food.mm).toLowerCase().includes(q));
    if (filterPrice === 'under800') list = list.filter((food) => food.price < 800);
    if (filterPrice === '800to999') list = list.filter((food) => food.price >= 800 && food.price < 1000);
    if (filterPrice === '1000plus') list = list.filter((food) => food.price >= 1000);
    if (filterSpice !== 'all') list = list.filter((food) => food.defaultSpice === filterSpice);
    if (filterAllergy !== 'all') list = list.filter((food) => !allergyOf(food).split('・').includes(filterAllergy));
    return list;
  }, [category, query, favoritesOnly, favorites, filterPrice, filterSpice, filterAllergy]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const fee = method === 'delivery' && cart.length && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const couponDiscount = appliedCoupon === 'HOME10' ? Math.floor(subtotal * .1) : appliedCoupon === 'NAHA200' && subtotal >= 1500 ? 200 : 0;
  const paymentTotal = Math.max(0, subtotal - couponDiscount) + fee;
  const detailUnitPrice = selected ? selected.price
    + (selected.options.find((option) => option.id === detailOption)?.price || 0)
    + (selected.secondaryOptions?.find((option) => option.id === detailSecondary)?.price || 0)
    + selected.toppings.filter((topping) => detailToppings.includes(topping.id)).reduce((sum, topping) => sum + topping.price, 0)
    : 0;
  const requiredMultiCount = selected?.selectionLimit?.[detailOption || ''] || 0;
  const requiredComplete = Boolean(
    detailOption && detailSpice
    && (!selected?.secondaryOptions || detailSecondary)
    && (!selected?.multiOptions || detailMulti.length === requiredMultiCount)
  );

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };
  const openFood = (food: Food) => {
    setEditingIndex(null);
    setSelected(food);
    setDetailQty(1);
    setDetailOption(food.defaultOption || null);
    setDetailSpice(food.defaultSpice || null);
    setDetailSecondary(food.defaultSecondary || null);
    setDetailMulti([]);
    setDetailToppings([]);
    setDetailNote('');
  };
  const editCartItem = (item: CartItem, index: number) => {
    setEditingIndex(index);
    setSelected(item);
    setDetailQty(item.quantity);
    setDetailOption(item.selectedOption);
    setDetailSpice(item.selectedSpice);
    setDetailSecondary(item.selectedSecondary || null);
    setDetailMulti(item.selectedMulti);
    setDetailToppings(item.selectedToppings);
    setDetailNote(item.note);
    setShowCart(false);
  };
  const addSelected = () => {
    if (!selected || !detailOption || !detailSpice || !requiredComplete) return;
    const optionPrice = selected.options.find((option) => option.id === detailOption)?.price || 0;
    const secondaryPrice = selected.secondaryOptions?.find((option) => option.id === detailSecondary)?.price || 0;
    const toppingPrice = selected.toppings.filter((topping) => detailToppings.includes(topping.id)).reduce((sum, topping) => sum + topping.price, 0);
    const unitPrice = selected.price + optionPrice + secondaryPrice + toppingPrice;
    const nextItem: CartItem = { ...selected, quantity: detailQty, selectedOption: detailOption, selectedSpice: detailSpice, selectedSecondary: detailSecondary || '', selectedMulti: detailMulti, selectedToppings: detailToppings, note: detailNote, unitPrice };
    setCart((items) => {
      if (editingIndex !== null) return items.map((item, index) => index === editingIndex ? nextItem : item);
      const toppingKey = detailToppings.slice().sort().join(',');
      const multiKey = detailMulti.slice().sort().join(',');
      const found = items.findIndex((item) => item.id === selected.id && item.selectedOption === detailOption && item.selectedSpice === detailSpice && item.selectedSecondary === (detailSecondary || '') && item.selectedMulti.slice().sort().join(',') === multiKey && item.selectedToppings.slice().sort().join(',') === toppingKey && item.note === detailNote);
      if (found < 0) return items.concat([nextItem]);
      return items.map((item, index) => index === found ? { ...item, quantity: item.quantity + detailQty } : item);
    });
    setEditingIndex(null);
    setSelected(null);
    flash(editingIndex !== null ? (language === 'jp' ? '注文内容を更新しました' : 'မှာယူမှုကို ပြင်ဆင်ပြီးပါပြီ') : language === 'jp' ? 'カートに追加しました' : 'ခြင်းထဲသို့ ထည့်ပြီးပါပြီ');
  };
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === 'HOME10' || (code === 'NAHA200' && subtotal >= 1500)) {
      setAppliedCoupon(code); setCouponInput(code);
      flash(language === 'jp' ? 'クーポンを適用しました' : 'ကူပွန်ကို အသုံးပြုပြီးပါပြီ');
    } else {
      setAppliedCoupon('');
      flash(language === 'jp' ? 'クーポンコードを確認してください（HOME10 / NAHA200）' : 'ကူပွန်ကုဒ်ကို စစ်ဆေးပါ (HOME10 / NAHA200)');
    }
  };
  const placeOrder = () => {
    if (method === 'delivery' && (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim())) {
      flash(language === 'jp' ? 'お名前・電話番号・住所を入力してください' : 'အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာကို ဖြည့်ပါ'); return;
    }
    const record: OrderRecord = {
      id: createOrderId(), items: cart, total: paymentTotal, method,
      receiveTime: checkoutForm.timing === 'scheduled' && checkoutForm.scheduled ? checkoutForm.scheduled : method === 'delivery' ? '35〜45分' : '15〜20分',
      createdAt: new Date().toLocaleString('ja-JP'), status:'受付', payment:checkoutForm.payment,
      subtotal, deliveryFee:fee, discount:couponDiscount,
      customer: method === 'delivery' ? { name:checkoutForm.name, phone:checkoutForm.phone, address:checkoutForm.address } : undefined,
    };
    setOrders((list) => { const next = [record, ...list]; window.localStorage.setItem('home-myanmar-orders', JSON.stringify(next)); return next; });
    setCompletedOrder(record);
    setCart([]); setCheckout(false); setTracking(true); setActiveTab('orders');
    setCheckoutReview(false);
    setAppliedCoupon(''); setCouponInput('');
  };
  const openCheckoutReview = () => {
    if (method === 'delivery' && (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim())) {
      flash(language === 'jp' ? 'お名前・電話番号・住所を入力してください' : 'အမည်၊ ဖုန်းနံပါတ်နှင့် လိပ်စာကို ဖြည့်ပါ'); return;
    }
    if (checkoutForm.timing === 'scheduled' && !checkoutForm.scheduled) { flash(language === 'jp' ? '受取時間を指定してください' : 'လက်ခံမည့်အချိန်ကို သတ်မှတ်ပါ'); return; }
    if (checkoutForm.payment === 'card' && (!checkoutForm.cardNumber.trim() || !checkoutForm.expiry.trim() || !checkoutForm.cvc.trim())) {
      flash(language === 'jp' ? 'カード情報を入力してください' : 'ကတ်အချက်အလက်ကို ဖြည့်ပါ'); return;
    }
    setCheckoutReview(true);
  };
  const recommendation = useMemo(() => {
    if (!recommendType || recommendSpicy === null) return null;
    const candidates = foods.filter((food) => food.category === recommendType && food.id !== 47);
    return candidates.find((food) => recommendSpicy ? ['mild','normal','hot'].includes(food.defaultSpice) : food.defaultSpice === 'none') || candidates[0] || null;
  }, [recommendType, recommendSpicy]);
  const goTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'cart') setShowCart(true);
    if (tab === 'orders') {
      setShowHistory(true);
    }
    if (tab === 'menu') document.getElementById('menu')?.scrollIntoView();
  };
  const profileAction = (action: string) => {
    if (action === 'address') setProfilePanel('address');
    if (action === 'payment') setProfilePanel('payment');
    if (action === 'current') { setActiveTab('home'); setShowHistory(true); }
    if (action === 'favorites') { setFavoritesOnly(true); setCategory('popular'); setQuery(''); setActiveTab('home'); window.setTimeout(() => document.getElementById('menu')?.scrollIntoView(), 50); }
    if (action === 'language') { setLanguage(language === 'jp' ? 'mm' : 'jp'); flash(language === 'jp' ? 'မြန်မာဘာသာသို့ ပြောင်းပြီးပါပြီ' : '日本語に切り替えました'); }
  };

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <button className='brand' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>MYANMAR RESTAURANT</small></div></button>
        <button className='header-location' onClick={() => setInfoPanel('location')}><span className='pin'>●</span><div><small>{t('deliveryDestination')}</small><strong>沖縄県 那覇市 泉崎 1-1</strong></div><span>⌄</span></button>
        <div className='header-actions'>
          <button className='language' onClick={() => setLanguage(language === 'jp' ? 'mm' : 'jp')}><span>{language === 'jp' ? 'JP' : 'MM'}</span>{language === 'jp' ? '日本語' : 'မြန်မာ'}</button>
          <button className='round' aria-label='Notifications' onClick={() => setInfoPanel('notifications')}>♢<span className='alert-dot'/></button>
          <button className='profile' onClick={() => goTab('mypage')}><span>G</span><div><small>{t('guest')}</small><strong>{t('orderInfo')}</strong></div></button>
        </div>
      </header>

      <section className='hero'>
        <div className='hero-copy'>
          <p className='eyebrow'>AUTHENTIC MYANMAR FLAVORS</p>
          <h1>{language === 'jp' ? <>今日は、何を<br/><em>食べますか？</em></> : <>ဒီနေ့ ဘာစား<br/><em>ချင်ပါသလဲ?</em></>}</h1>
          <p>{language === 'jp' ? '故郷の味を、那覇のあなたの食卓へ。' : 'မြန်မာ့အရသာကို နာဟာမြို့က သင့်အိမ်အရောက်။'}</p>
          <div className='search-box'><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setFavoritesOnly(false); }} placeholder={language === 'jp' ? '料理名を検索…' : 'အစားအစာရှာရန်…'}/><button onClick={() => document.getElementById('menu')?.scrollIntoView()}>{t('search')}</button></div>
          <div className='hero-actions'><button className='hero-primary' onClick={() => document.getElementById('menu')?.scrollIntoView()}>{t('viewMenu')}</button><button className='hero-secondary' onClick={() => setShowRecommend(true)}>{t('recommendation')}</button></div>
        </div>
        <div className='hero-image'>
          <img src={foods[0].image} alt='Mohinga, traditional Myanmar noodle soup' fetchPriority='high'/>
          <div className='hero-badge'><b>4.9</b><span>★ ★ ★ ★ ★<br/><small>1,240 reviews · {t('demoDisplay')}</small></span></div>
          <div className='hero-caption'><small>TODAY&apos;S PICK</small><strong>မုန့်ဟင်းခါး</strong><span>モヒンガー</span></div>
        </div>
      </section>

      <section className='control-strip'>
        <div className='method-switch'>
          <button className={method === 'delivery' ? 'active' : ''} onClick={() => setMethod('delivery')}><span>◈</span><div><b>{t('delivery')}</b><small>30–45 min</small></div></button>
          <button className={method === 'pickup' ? 'active' : ''} onClick={() => setMethod('pickup')}><span>▣</span><div><b>{t('pickup')}</b><small>15–20 min</small></div></button>
        </div>
        <p><span>●</span> {t('accepting')} <small>・ {t('freeDelivery')}</small></p>
      </section>

      <section className='content-section' id='menu'>
        <div className='section-heading'><div><p className='eyebrow'>EXPLORE OUR MENU</p><h2>{t('categories')}</h2></div><button className='view-all' onClick={() => { setCategory('all'); setFavoritesOnly(false); }}>{t('viewAll')} <span>→</span></button></div>
        <div className='categories'>
          {categories.map((item) => <button key={item.id} onClick={() => { setCategory(item.id); setFavoritesOnly(false); }} className={!favoritesOnly && category === item.id ? 'active' : ''}><span>{item.icon}</span><strong>{language === 'jp' ? item.jp : item.mm}</strong><small>{language === 'jp' ? item.mm : item.jp}</small></button>)}
        </div>
      </section>

      <section className='content-section menu-section'>
        <div className='section-heading'><div><p className='eyebrow'>CHEF&apos;S SELECTION</p><h2>{favoritesOnly ? t('favorites') : category === 'all' ? t('allMenu') : (language === 'jp' ? categories.find((item) => item.id === category)?.jp : categories.find((item) => item.id === category)?.mm)}</h2><p className='result-count'>{filteredFoods.length}{t('found')}</p></div><div className='filters'><button className='active'>{t('recommendedOrder')}</button><button onClick={() => setShowFilter(true)}>⚙ {t('filter')}</button></div></div>
        {filteredFoods.length ? <div className='food-grid'>
          {filteredFoods.map((food) => <article className='food-card' key={food.id}>
            <button className={'heart ' + (favorites.includes(food.id) ? 'liked' : '')} aria-label='Favorite' onClick={() => setFavorites((list) => list.includes(food.id) ? list.filter((id) => id !== food.id) : list.concat(food.id))}>♥</button>
            <button className='food-image' onClick={() => openFood(food)}>{food.image ? <img src={food.image} alt={food.jp} loading='lazy' decoding='async'/> : <span className='food-placeholder'><b>Ⴙ</b><small>{food.mm}<br/>{food.jp}</small></span>}{food.special && <span className='special-badge'>{food.id === 47 ? 'FAMILY SET' : <>TODAY&apos;S SPECIAL</>}</span>}</button>
            <div className='food-info'><div className='food-badges'>{popularMenuIds.has(food.id) && <span>{t('popular')}</span>}{beginnerIds.has(food.id) && <span>{t('beginner')}</span>}{vegetarianIds.has(food.id) && <span>{t('vegetarian')}</span>}</div><div className='food-title'><div><small>{food.mm}</small><h3>{food.jp}</h3></div>{food.category !== 'drink' && food.category !== 'dessert' && !food.hideSpice && <span className='spicy'>{t('spicyLevel')} 0–3</span>}</div><p>{food.description}</p><div className='food-bottom'><strong>{yen(food.price)}</strong><button onClick={() => openFood(food)}>＋ {t('choose')}</button></div></div>
          </article>)}
        </div> : <div className='empty-state'><span>⌕</span><h3>{t('noFood')}</h3><button onClick={() => setQuery('')}>{t('clearSearch')}</button></div>}
      </section>

      <section className='promo-banner'>
        <img className='promo-photo' src={foods.find((food) => food.id === 47)?.image} alt='Myanmar Family Set' loading='lazy' decoding='async'/>
        <div><p className='eyebrow light'>WEEKEND SPECIAL</p><h2>{language === 'jp' ? <>家族の食卓に、<br/>もっとミャンマーを。</> : <>မိသားစုထမင်းဝိုင်းမှာ<br/>မြန်မာ့အရသာကို ပိုမိုခံစားပါ။</>}</h2><p>{language === 'jp' ? 'カレー2品・ライス4人前・サラダ・ミャンマー茶のお得なセット' : 'ဟင်း ၂ မျိုး၊ ထမင်း ၄ ယောက်စာ၊ အသုပ်နှင့် မြန်မာရေနွေးကြမ်း ပါဝင်သောတန်ဖိုးရှိအစုံ'}</p><button onClick={() => { const familySet = foods.find((food) => food.id === 47); if (familySet) openFood(familySet); }}>{language === 'jp' ? 'セットを見る' : 'အစုံကိုကြည့်ရန်'} →</button></div>
        <div className='promo-price'><small>FAMILY SET</small><strong>¥3,800</strong><span>通常 ¥4,600</span></div>
      </section>

      <footer><div className='brand inverted'><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>MYANMAR RESTAURANT</small><span className='brand-tagline'>{language === 'jp' ? '那覇で楽しむ、本格ミャンマー料理。' : 'နာဟာမြို့မှာ စစ်မှန်တဲ့ မြန်မာအစားအစာကို ခံစားပါ။'}</span></div></div><div><span>{t('hours')}</span><a href='mailto:home@gmail.com'>home@gmail.com</a><a href='tel:09012340000'>090-1234-0000</a><button onClick={() => setInfoPanel('store')}>{t('storeInfo')}</button><button onClick={() => setInfoPanel('legal')}>{t('legal')}</button><button onClick={() => setInfoPanel('privacy')}>{t('privacy')}</button><button onClick={() => setInfoPanel('cancellation')}>{t('cancellation')}</button><a href={sitePath('/staff/')}>{t('staffManagement')}</a></div></footer>

      <nav className='bottom-nav' aria-label='Main navigation'>
        {[['home','⌂',t('home')],['menu','≡',t('menu')],['cart','◇',t('cart')],['orders','◴',t('order')],['mypage','○',t('orderInfo')]].map((item) => <button key={item[0]} className={activeTab === item[0] ? 'active' : ''} onClick={() => goTab(item[0])}><span>{item[1]}{item[0] === 'cart' && cartCount > 0 && <b>{cartCount}</b>}</span><small>{item[2]}</small></button>)}
      </nav>

      {selected && <div className='modal-layer' onMouseDown={(event) => event.currentTarget === event.target && setSelected(null)}>
        <div className='detail-drawer'>
          <button className='modal-close' onClick={() => setSelected(null)}>×</button>
          <div className='detail-photo'>{selected.image ? <img src={selected.image} alt={selected.jp}/> : <div className='detail-placeholder'><b>Ⴙ</b><strong>{selected.mm}</strong><small>{selected.jp}</small></div>}<span>{selected.id === 47 ? 'FAMILY SET' : selected.category.toUpperCase()}</span></div>
          <div className='detail-content'>
            <p className='eyebrow'>{t('foodDetail')}</p>
            <small className='mm-name'>{selected.mm}</small>
            <h2>{selected.jp}</h2>
            <strong className='detail-base-price'>{yen(selected.price)}</strong>
            <p className='detail-desc'>{selected.description}</p>
            <div className='food-facts'><span><b>{t('taste')}</b>{tasteOf(selected, language)}</span>{selected.category !== 'drink' && selected.category !== 'dessert' && !selected.hideSpice && <span><b>{t('spicyLevel')}</b>{selected.defaultSpice === 'none' ? '0 / 3' : selected.defaultSpice === 'mild' ? '1 / 3' : selected.defaultSpice === 'normal' ? '2 / 3' : '3 / 3'}</span>}<span><b>{t('allergy')}</b>{allergyOf(selected, language)}</span></div>

            <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.optionTitle}</strong><span>（{t('required')}）</span></div>
              <div className='choice-list'>
                {selected.options.map((option) => <label className={detailOption === option.id ? 'selected' : ''} key={option.id}>
                  <input type='radio' name='food-option' checked={detailOption === option.id} onChange={() => setDetailOption(option.id)}/>
                  <span className='radio-mark'/><b>{option.label}</b>{option.price > 0 && <strong>+{yen(option.price)}</strong>}
                </label>)}
              </div>
              {selected.id === 5 && detailOption === 'oil' && <div className='soup-note'><b>ဟင်းရည်သီးခြားပါဝင်သည်</b><span>スープ付き</span></div>}
            </div>

            {selected.secondaryOptions && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.secondaryTitle}</strong><span>（{t('required')}）</span></div>
              <div className='choice-list'>
                {selected.secondaryOptions.map((option) => <label className={detailSecondary === option.id ? 'selected' : ''} key={option.id}>
                  <input type='radio' name='secondary-option' checked={detailSecondary === option.id} onChange={() => setDetailSecondary(option.id)}/>
                  <span className='radio-mark'/><b>{option.label}</b>{option.price > 0 && <strong>+{yen(option.price)}</strong>}
                </label>)}
              </div>
            </div>}

            {!selected.hideSpice && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.spiceTitle || 'အစပ်အဆင့်ရွေးပါ / 辛さを選択'}</strong><span>（{t('required')}）</span></div>
              <div className='choice-list spice-list'>
                {(selected.flavors || spiceOptions).map((spice) => <label className={detailSpice === spice.id ? 'selected' : ''} key={spice.id}>
                  <input type='radio' name='spice-option' checked={detailSpice === spice.id} onChange={() => setDetailSpice(spice.id)}/>
                  <span className='radio-mark'/><b>{spice.label}</b>
                </label>)}
              </div>
            </div>}

            {selected.multiOptions && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.multiTitle}</strong><span>（{t('required')}・{language === 'jp' ? '複数選択可' : 'တစ်ခုထက်ပိုရွေးနိုင်'}）</span></div>
              <p className='selection-counter'>{requiredMultiCount}種類を選択：<b>{detailMulti.length} / {requiredMultiCount}</b></p>
              <div className='choice-list topping-list'>
                {selected.multiOptions.map((option) => <label className={detailMulti.includes(option.id) ? 'selected' : ''} key={option.id}>
                  <input type='checkbox' checked={detailMulti.includes(option.id)} onChange={() => setDetailMulti((list) => list.includes(option.id) ? list.filter((id) => id !== option.id) : list.length < requiredMultiCount ? list.concat(option.id) : list)}/>
                  <span className='check-mark'/><b>{option.label}</b>
                </label>)}
              </div>
            </div>}

            {selected.toppings.length > 0 && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{t('toppings')}</strong><span>（{t('optional')}）</span></div>
              <div className='choice-list topping-list'>
                {selected.toppings.map((topping) => <label className={detailToppings.includes(topping.id) ? 'selected' : ''} key={topping.id}>
                  <input type='checkbox' checked={detailToppings.includes(topping.id)} onChange={() => setDetailToppings((list) => list.includes(topping.id) ? list.filter((id) => id !== topping.id) : list.concat(topping.id))}/>
                  <span className='check-mark'/><b>{topping.label}</b><strong>+{yen(topping.price)}</strong>
                </label>)}
              </div>
            </div>}

            <label className='request-note'>
              <span><b>{t('request')}</b>（{t('optional')}）</span>
              <small>{t('requestSub')}</small>
              <textarea value={detailNote} onChange={(event) => setDetailNote(event.target.value)} placeholder={'例：ကြက်သွန်နီမထည့်ပါနှင့်\n例：玉ねぎ抜き'}/>
            </label>

            <div className='detail-actions'>
              <div><span>{t('quantity')}</span><div className='quantity'><button onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>−</button><b>{detailQty}</b><button onClick={() => setDetailQty(detailQty + 1)}>+</button></div></div>
              <button className='primary add-cart' disabled={!requiredComplete} onClick={addSelected}><span>{yen(detailUnitPrice * detailQty)}</span>{editingIndex !== null ? t('saveChanges') : t('addCart')}</button>
            </div>
            {!requiredComplete && <p className='required-warning'>{t('requiredWarning')}</p>}
          </div>
        </div>
      </div>}

      {showCart && <div className='modal-layer right' onMouseDown={(event) => event.currentTarget === event.target && setShowCart(false)}><aside className='cart-drawer'>
        <div className='drawer-head'><div><p className='eyebrow'>{t('yourOrder')}</p><h2>{t('cart')} <span>{cartCount}{t('items')}</span></h2></div><button className='modal-close static' onClick={() => setShowCart(false)}>×</button></div>
        {cart.length ? <><div className='cart-list'>{cart.map((item, index) => <div className='cart-item' key={item.id + '-' + index}>
          {item.image ? <img src={item.image} alt=''/> : <span className='cart-placeholder'>Ⴙ</span>}
          <div><strong>{item.mm} / {item.jp}</strong>
            <small>{item.options.find((option) => option.id === item.selectedOption)?.label}{!item.hideSpice && ' · ' + (item.flavors || spiceOptions).find((spice) => spice.id === item.selectedSpice)?.label}</small>
            {item.secondaryOptions && <small>+ {item.secondaryOptions.find((option) => option.id === item.selectedSecondary)?.label}</small>}
            {item.selectedMulti.length > 0 && <small>+ {item.multiOptions?.filter((option) => item.selectedMulti.includes(option.id)).map((option) => option.label).join('、')}</small>}
            {item.selectedToppings.length > 0 && <small>+ {item.toppings.filter((topping) => item.selectedToppings.includes(topping.id)).map((topping) => topping.label).join('、')}</small>}
            {item.note && <small className='cart-note'>{t('note')}: {item.note}</small>}
            <div className='mini-quantity'><button onClick={() => setCart((items) => items.map((entry, i) => i === index ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button><span>{item.quantity}</span><button onClick={() => setCart((items) => items.map((entry, i) => i === index ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button></div>
            <button className='edit-item' onClick={() => editCartItem(item, index)}>{t('edit')}</button>
          </div><div className='cart-price'><button aria-label={t('delete')} onClick={() => setCart((items) => items.filter((_, i) => i !== index))}>×</button><strong>{yen(item.unitPrice * item.quantity)}</strong></div>
        </div>)}</div>
          <label className='coupon'><span>◇</span><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder={t('coupon')}/><button type='button' onClick={applyCoupon}>{t('apply')}</button></label><textarea className='notes' value={checkoutForm.note} onChange={(event) => setCheckoutForm({...checkoutForm,note:event.target.value})} placeholder={t('storeMemo')}/>
          <div className='summary'><p><span>{t('subtotal')}</span><b>{yen(subtotal)}</b></p>{couponDiscount > 0 && <p className='discount-row'><span>{t('discount')} ({appliedCoupon})</span><b>−{yen(couponDiscount)}</b></p>}<p><span>{t('deliveryFee')}</span><b>{method === 'delivery' ? fee ? yen(fee) : t('free') : t('free')}</b></p><div><span>{t('paymentTotal')} <small>（{t('taxIncluded')}）</small></span><strong>{yen(paymentTotal)}</strong></div></div>
          <button className='primary wide checkout-button' onClick={() => { setShowCart(false); setCheckoutReview(false); setCheckout(true); }}>{t('proceedCheckout')} <span>→</span></button></> :
          <div className='cart-empty'><span>◇</span><h3>{t('emptyCart')}</h3><p>{t('chooseFood')}</p><button className='primary' onClick={() => setShowCart(false)}>{t('viewMenu')}</button></div>}
      </aside></div>}

      {checkout && <div className='modal-layer'><div className='checkout-modal'><button className='modal-close' onClick={() => { setCheckout(false); setCheckoutReview(false); }}>×</button>
        <div className='checkout-title'><p className='eyebrow'>{t('checkout')}</p><h2>{t('deliveryInfo')}</h2><p>{language === 'jp' ? '注文情報' : 'အော်ဒါအချက်အလက်များ'}</p></div>
        {!checkoutReview ? <div className='checkout-grid'><div><h3>1. {t('receiveMethod')}</h3><div className='method-switch checkout-method'><button className={method === 'delivery' ? 'active' : ''} onClick={() => setMethod('delivery')}><span>◈</span><div><b>{t('delivery')}</b><small>{t('deliveryToAddress')}</small></div></button><button className={method === 'pickup' ? 'active' : ''} onClick={() => setMethod('pickup')}><span>▣</span><div><b>{t('pickup')}</b><small>{t('pickupAtStore')}</small></div></button></div>
          {method === 'delivery' && <><h3>2. {t('customerInfo')}</h3><div className='form-grid'><label><span>{t('nameRequired')}</span><input value={checkoutForm.name} onChange={(e) => setCheckoutForm({...checkoutForm,name:e.target.value})} placeholder={language === 'jp' ? '例）アイ・タンダー' : 'ဥပမာ) Aye Thandar'}/></label><label><span>{t('phoneRequired')}</span><input value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm,phone:e.target.value})} placeholder='090-1234-5678'/></label><label className='full'><span>{t('addressRequired')}</span><input value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm,address:e.target.value})} placeholder='沖縄県那覇市泉崎 1-1-1'/></label></div></>}
          <h3>{method === 'delivery' ? 3 : 2}. {t('receiveTime')}</h3><div className='timing-options'><label><input type='radio' checked={checkoutForm.timing === 'asap'} onChange={() => setCheckoutForm({...checkoutForm,timing:'asap'})}/>{t('asap')}</label><label><input type='radio' checked={checkoutForm.timing === 'scheduled'} onChange={() => setCheckoutForm({...checkoutForm,timing:'scheduled'})}/>{t('schedule')}</label>{checkoutForm.timing === 'scheduled' && <input type='datetime-local' value={checkoutForm.scheduled} onChange={(e) => setCheckoutForm({...checkoutForm,scheduled:e.target.value})}/>}</div>
          <label className='checkout-note'><span>{t('remarks')}</span><textarea value={checkoutForm.note} onChange={(e) => setCheckoutForm({...checkoutForm,note:e.target.value})} placeholder={t('remarksPlaceholder')}/></label>
        </div><div className='payment-side'><h3>{method === 'delivery' ? 4 : 3}. {t('payment')}</h3>{[{id:'cash',label:t('cash'),icon:'¥'},{id:'card',label:t('card'),icon:'▣'},{id:'paypay',label:'PayPay',icon:'P'}].map((pay) => <label className={'payment ' + (checkoutForm.payment === pay.id ? 'selected' : '')} key={pay.id}><input type='radio' name='payment' checked={checkoutForm.payment === pay.id} onChange={() => setCheckoutForm({...checkoutForm,payment:pay.id})}/><span>{pay.icon}</span><b>{pay.label}{pay.id !== 'cash' && <small className='demo-payment'> · {t('demoPayment')}</small>}</b></label>)}
          {checkoutForm.payment === 'card' && <div className='payment-fields'><label><span>{t('cardNumber')}</span><input inputMode='numeric' value={checkoutForm.cardNumber} onChange={(e) => setCheckoutForm({...checkoutForm,cardNumber:e.target.value})} placeholder='1234 5678 9012 3456'/></label><div><label><span>{t('expiry')}</span><input value={checkoutForm.expiry} onChange={(e) => setCheckoutForm({...checkoutForm,expiry:e.target.value})} placeholder='MM/YY'/></label><label><span>CVC</span><input inputMode='numeric' value={checkoutForm.cvc} onChange={(e) => setCheckoutForm({...checkoutForm,cvc:e.target.value})} placeholder='123'/></label></div></div>}
          {checkoutForm.payment === 'paypay' && <p className='payment-help'>{t('paypayHelp')}</p>}
          <div className='order-total'><p><span>{t('productTotal')}</span><b>{yen(subtotal)}</b></p>{couponDiscount > 0 && <p className='discount-row'><span>{t('discount')}</span><b>−{yen(couponDiscount)}</b></p>}<p><span>{t('deliveryFee')}</span><b>{fee ? yen(fee) : t('free')}</b></p><div><span>{t('paymentTotal')}</span><strong>{yen(paymentTotal)}</strong></div></div><button className='primary wide' onClick={openCheckoutReview}>{yen(paymentTotal)}　{t('reviewOrder')}</button><small className='secure'>{t('notConfirmed')}</small></div></div> :
          <div className='checkout-review'><p className='eyebrow'>{t('finalReview')}</p><h2>{t('finalTitle')}</h2><p>{t('finalHelp')}</p><div className='review-summary'><section><h3>{t('orderItems')}</h3><div className='review-items'>{cart.map((item, index) => <p key={item.id + '-review-' + index}><span>{language === 'jp' ? item.jp : item.mm} × {item.quantity}</span><b>{yen(item.unitPrice * item.quantity)}</b></p>)}</div><p><span>{t('productTotal')}</span><b>{yen(subtotal)}</b></p>{couponDiscount > 0 && <p className='discount-row'><span>{t('discount')}</span><b>−{yen(couponDiscount)}</b></p>}<p><span>{t('deliveryFee')}</span><b>{fee ? yen(fee) : t('free')}</b></p><div><span>{t('paymentTotal')}</span><strong>{yen(paymentTotal)}</strong></div></section><section><h3>{t('receiveInfo')}</h3><p><span>{t('method')}</span><b>{method === 'delivery' ? t('delivery') : t('pickup')}</b></p>{method === 'delivery' && <><p><span>{t('address')}</span><b>{checkoutForm.address}</b></p><p><span>{t('name')}</span><b>{checkoutForm.name}</b></p><p><span>{t('phone')}</span><b>{checkoutForm.phone}</b></p></>}<p><span>{t('receiveTime')}</span><b>{checkoutForm.timing === 'asap' ? t('asap') : checkoutForm.scheduled}</b></p><p><span>{t('payment')}</span><b>{checkoutForm.payment === 'cash' ? t('cash') : checkoutForm.payment === 'card' ? `${t('card')} · ${t('demoPayment')}` : `PayPay · ${t('demoPayment')}`}</b></p>{checkoutForm.note && <p><span>{t('note')}</span><b>{checkoutForm.note}</b></p>}</section></div><div className='review-actions'><button className='secondary' onClick={() => setCheckoutReview(false)}>{t('backEdit')}</button><button className='primary' onClick={placeOrder}>{yen(paymentTotal)}　{t('placeOrder')}</button></div></div>}
      </div></div>}

      {tracking && completedOrder && <div className='modal-layer'><div className='tracking-card'><button className='modal-close' onClick={() => setTracking(false)}>×</button><div className='success-icon'>✓</div><p className='eyebrow'>ORDER #{completedOrder.id}</p><h2>{completedOrder.status === '完了' ? t('orderComplete') : t('trackingTitle')}</h2><p>{t('thanks')}</p><div className='order-progress'>{(completedOrder.method === 'delivery' ? ['受付','調理中','配達中','完了'] : ['受付','調理中','受取待ち','完了']).map((status, index, steps) => { const current = Math.max(0, steps.indexOf(completedOrder.status)); return <div className={index <= current ? 'active' : ''} key={status}><span>{index < current ? '✓' : index + 1}</span><b>{status === '受付' ? t('accepted') : status === '調理中' ? t('cooking') : status === '配達中' ? t('delivering') : status === '受取待ち' ? t('readyPickup') : t('completed')}</b></div>; })}</div><div className='eta'><small>{completedOrder.method === 'delivery' ? 'DELIVERY TIME' : 'PICKUP TIME'}</small><strong>{completedOrder.receiveTime}</strong></div><div className='complete-items'>{completedOrder.items.map((item,index) => <p key={item.id + '-' + index}><span>{language === 'jp' ? item.jp : item.mm} × {item.quantity}</span><b>{yen(item.unitPrice * item.quantity)}</b></p>)}</div><div className='complete-total'><span>{t('total')}</span><strong>{yen(completedOrder.total)}</strong></div><small className='order-date'>{completedOrder.createdAt}</small><button className='secondary wide' onClick={() => setTracking(false)}>{t('backHome')}</button></div></div>}

      {showFilter && <div className='modal-layer' onMouseDown={(event) => event.currentTarget === event.target && setShowFilter(false)}><div className='simple-panel filter-panel'><button className='modal-close' onClick={() => setShowFilter(false)}>×</button><p className='eyebrow'>MENU FILTER</p><h2>{t('filterTitle')}</h2><label><span>{t('priceRange')}</span><select value={filterPrice} onChange={(event) => setFilterPrice(event.target.value as FilterPrice)}><option value='all'>{language === 'jp' ? '指定なし' : 'အားလုံး'}</option><option value='under800'>¥800未満</option><option value='800to999'>¥800–¥999</option><option value='1000plus'>¥1,000以上</option></select></label><label><span>{t('spicyLevel')}</span><select value={filterSpice} onChange={(event) => setFilterSpice(event.target.value as FilterSpice)}><option value='all'>{language === 'jp' ? '指定なし' : 'အားလုံး'}</option>{spiceOptions.map((spice) => <option key={spice.id} value={spice.id}>{spice.label}</option>)}</select></label><label><span>{t('excludedAllergy')}</span><select value={filterAllergy} onChange={(event) => setFilterAllergy(event.target.value)}><option value='all'>{language === 'jp' ? '指定なし' : 'မသတ်မှတ်ပါ'}</option>{['卵','乳','小麦','落花生','えび','魚'].map((allergy) => <option key={allergy}>{allergy}</option>)}</select></label><div className='panel-actions'><button className='secondary' onClick={() => { setFilterPrice('all'); setFilterSpice('all'); setFilterAllergy('all'); }}>{t('reset')}</button><button className='primary' onClick={() => setShowFilter(false)}>{filteredFoods.length}{t('found')} · {t('showResults')}</button></div></div></div>}

      {infoPanel && <div className='modal-layer' onMouseDown={(event) => event.currentTarget === event.target && setInfoPanel(null)}><div className='simple-panel info-panel'><button className='modal-close' onClick={() => setInfoPanel(null)}>×</button><p className='eyebrow'>HOME MYANMAR RESTAURANT · DEMO</p><h2>{infoPanel === 'location' ? t('locationTitle') : infoPanel === 'notifications' ? t('notificationTitle') : infoPanel === 'legal' ? t('legal') : infoPanel === 'privacy' ? t('privacy') : infoPanel === 'cancellation' ? t('cancellation') : t('storeInfo')}</h2>{infoPanel === 'location' && <><p>沖縄県 那覇市 泉崎 1-1（{t('demoDisplay')}）</p><p>{language === 'jp' ? '配達範囲：那覇市内・店舗から約5km以内' : 'ပို့ဆောင်သည့်ဧရိယာ: နာဟာမြို့အတွင်း ဆိုင်မှ ၅ ကီလိုမီတာခန့်'}</p></>}{infoPanel === 'notifications' && <><p>{language === 'jp' ? '¥2,000以上のご注文は配送料無料です。' : '¥2,000 နှင့်အထက်မှာယူမှုများအတွက် ပို့ခအခမဲ့ဖြစ်ပါသည်။'}</p><p>{language === 'jp' ? '現在、新しい店舗からのお知らせはありません。' : 'ယခုအချိန်တွင် ဆိုင်မှ အသိပေးချက်အသစ် မရှိပါ။'}</p></>}{infoPanel === 'store' && <><p>{t('hours')} · {language === 'jp' ? '定休日：不定休' : 'ပိတ်ရက်: မသတ်မှတ်ထား'}</p><p>{language === 'jp' ? '最低注文金額：なし／配達料：¥300（商品合計¥2,000以上で無料）' : 'အနည်းဆုံးမှာယူငွေ: မရှိ / ပို့ခ ¥300 (ပစ္စည်းစုစုပေါင်း ¥2,000 နှင့်အထက် အခမဲ့)'}</p></>}{infoPanel === 'legal' && <p>{language === 'jp' ? '販売事業者・住所・連絡先・価格・配送料はデモ表示です。実店舗運用前に正式な事業者情報へ差し替えてください。' : 'ရောင်းချသူ၊ လိပ်စာ၊ ဆက်သွယ်ရန်၊ ဈေးနှုန်းနှင့် ပို့ခများသည် စမ်းသပ်ဒေတာဖြစ်ပြီး အမှန်တကယ်အသုံးပြုမီ တရားဝင်အချက်အလက်များဖြင့် ပြောင်းလဲရပါမည်။'}</p>}{infoPanel === 'privacy' && <p>{language === 'jp' ? '入力情報は注文表示のため、この端末のブラウザー内にのみ保存されるデモ仕様です。' : 'ထည့်သွင်းထားသောအချက်အလက်များကို စမ်းသပ်မှာယူမှုအတွက် ဤစက်၏ browser အတွင်းသာ သိမ်းဆည်းပါသည်။'}</p>}{infoPanel === 'cancellation' && <p>{language === 'jp' ? '調理開始前はキャンセル可能です。調理開始後は店舗へお電話ください（デモ表示）。' : 'ချက်ပြုတ်မှုမစတင်မီ ပယ်ဖျက်နိုင်ပါသည်။ စတင်ပြီးနောက် ဆိုင်သို့ ဖုန်းဆက်ပါ (စမ်းသပ်ဒေတာ)။'}</p>}</div></div>}

      {showRecommend && <div className='modal-layer'><div className='recommend-card'><button className='modal-close' onClick={() => setShowRecommend(false)}>×</button><p className='eyebrow'>TODAY&apos;S RECOMMENDATION</p><h2>{t('recommendTitle')}</h2><p>{t('recommendHelp')}</p><h3>{t('whatEat')}</h3><div className='recommend-choices'><button className={recommendType === 'curry' ? 'active' : ''} onClick={() => setRecommendType('curry')}>{t('riceCurry')}</button><button className={recommendType === 'noodle' ? 'active' : ''} onClick={() => setRecommendType('noodle')}>{t('noodles')}</button></div><h3>{t('likeSpicy')}</h3><div className='recommend-choices'><button className={recommendSpicy === true ? 'active' : ''} onClick={() => setRecommendSpicy(true)}>{t('yes')}</button><button className={recommendSpicy === false ? 'active' : ''} onClick={() => setRecommendSpicy(false)}>{t('no')}</button></div>{recommendation && <div className='recommend-result'><small>{t('yourRecommendation')}</small><strong>{recommendation.mm}</strong><h3>{recommendation.jp}</h3><p>{tasteOf(recommendation, language)} · {yen(recommendation.price)}</p><button className='primary wide' onClick={() => { setShowRecommend(false); openFood(recommendation); }}>{t('seeDish')}</button></div>}</div></div>}

      {showHistory && <div className='modal-layer'><div className='history-card'><button className='modal-close' onClick={() => setShowHistory(false)}>×</button><p className='eyebrow'>ORDER HISTORY</p><h2>{t('orderHistory')}</h2>{orders.length ? <div className='history-list'>{orders.map((order) => <button key={order.id} onClick={() => { setCompletedOrder(order); setShowHistory(false); setTracking(true); }}><div><strong>#{order.id}</strong><small>{order.createdAt} · {order.method === 'delivery' ? t('delivery') : t('pickup')}</small></div><b>{yen(order.total)}</b><span>›</span></button>)}</div> : <div className='history-empty'><span>◴</span><p>{t('noHistory')}</p></div>}</div></div>}

      {activeTab === 'mypage' && <div className='modal-layer' onMouseDown={(event) => { if (event.currentTarget === event.target) { setActiveTab('home'); setProfilePanel(null); } }}><div className='profile-modal'><button className='modal-close' onClick={() => { setActiveTab('home'); setProfilePanel(null); }}>×</button><div className='profile-hero'><span>G</span><div><p className='eyebrow light'>GUEST ORDER</p><h2>{t('guestOrder')}</h2><small>{t('guestHelp')}</small></div></div>{!profilePanel ? <div className='profile-links'><button onClick={() => profileAction('address')}><span>◈</span><div><b>{t('deliveryAddress')}</b><small>{checkoutForm.address || 'Delivery Address'}</small></div><strong>›</strong></button><button onClick={() => profileAction('current')}><span>◴</span><div><b>{t('orderStatus')}</b><small>{orders.length ? 'Current Order' : t('noOrder')}</small></div><strong>›</strong></button><button onClick={() => profileAction('favorites')}><span>♥</span><div><b>{t('favorites')}</b><small>{favorites.length} items</small></div><strong>›</strong></button><button onClick={() => profileAction('payment')}><span>▣</span><div><b>{t('paymentMethod')}</b><small>{checkoutForm.payment === 'cash' ? t('cash') : checkoutForm.payment === 'card' ? t('card') : 'PayPay'}</small></div><strong>›</strong></button><button onClick={() => profileAction('language')}><span>◎</span><div><b>{t('languageSetting')}</b><small>日本語 / မြန်မာ</small></div><strong>›</strong></button></div> : <div className='profile-panel'><button className='profile-back' onClick={() => setProfilePanel(null)}>‹ {t('backOrderInfo')}</button>{profilePanel === 'address' ? <><h3>{t('deliveryAddress')}</h3><label className='profile-field'><span>{t('address')}</span><input value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm,address:e.target.value})} placeholder='沖縄県那覇市泉崎 1-1-1'/></label><button className='primary wide' onClick={() => { setProfilePanel(null); flash(language === 'jp' ? '配達先住所を保存しました' : 'ပို့ဆောင်မည့်လိပ်စာကို သိမ်းပြီးပါပြီ'); }}>{t('saveAddress')}</button></> : <><h3>{t('paymentMethod')}</h3><div className='profile-payment'>{[{id:'cash',label:t('cash')},{id:'card',label:t('card')},{id:'paypay',label:'PayPay'}].map((pay) => <label key={pay.id}><input type='radio' checked={checkoutForm.payment === pay.id} onChange={() => setCheckoutForm({...checkoutForm,payment:pay.id})}/><span>{pay.label}</span></label>)}</div><button className='primary wide' onClick={() => { setProfilePanel(null); flash(language === 'jp' ? '支払い方法を保存しました' : 'ငွေပေးချေနည်းကို သိမ်းပြီးပါပြီ'); }}>{t('savePayment')}</button></>}</div>}</div></div>}
      {toast && <div className='toast'><span>✓</span>{toast}</div>}
    </main>
  );
}
