'use client';

import { useMemo, useState } from 'react';

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

const categories = [
  { id: 'popular', icon: '✦', jp: '人気', mm: 'လူကြိုက်များ' },
  { id: 'curry', icon: '◒', jp: 'ご飯・カレー', mm: 'ထမင်း ဟင်း' },
  { id: 'noodle', icon: '≋', jp: '麺料理', mm: 'ခေါက်ဆွဲ' },
  { id: 'salad', icon: '✾', jp: 'サラダ', mm: 'အသုပ်' },
  { id: 'snack', icon: '◇', jp: 'スナック', mm: 'အဆာပြေ' },
  { id: 'drink', icon: '◌', jp: 'ドリンク', mm: 'အအေး' },
];

const spiceOptions = [
  { id: 'none', label: 'မစပ် / 辛くない' },
  { id: 'mild', label: 'အနည်းငယ်စပ် / ひかえめ' },
  { id: 'normal', label: 'ပုံမှန်စပ် / 普通' },
  { id: 'hot', label: 'အစပ် / 辛口' },
];

const foods: Food[] = [
  { id: 1, mm: 'မုန့်ဟင်းခါး', jp: 'モヒンガー', price: 850, category: 'noodle', popular: true,
    description: 'レモングラスが香る魚だしの米麺スープ。ミャンマーの国民的な朝ごはんです。',
    image: '/mohinga.png',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{ id:'regular',label:'ပုံမှန် / 普通',price:0 },{ id:'large',label:'အကြီး / 大盛り',price:200 }],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'fritter',label:'အကြော် / 揚げ物',price:150},{id:'fishcake',label:'ငါးဖယ် / フィッシュケーキ',price:200},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 2, mm: 'ရှမ်းခေါက်ဆွဲ', jp: 'シャンヌードル', price: 900, category: 'noodle', popular: true,
    description: '鶏肉とトマトの旨み、香ばしいナッツが調和するシャン州の人気麺料理。',
    image: '/shan-noodles.png',
    optionTitle: 'အမျိုးအစားရွေးပါ / 種類を選択', defaultOption: 'dry', defaultSpice: 'mild',
    options: [{id:'dry',label:'အသုပ် / 汁なし',price:0},{id:'soup',label:'အရည် / スープ',price:0}],
    toppings: [{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'greens',label:'အစိမ်းရွက်အပို / 青菜追加',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 3, mm: 'တိုဖူးနွေး', jp: '温かいひよこ豆豆腐麺', price: 900, category: 'noodle', popular: true, special: true,
    description: 'なめらかなひよこ豆豆腐を麺に絡めた、やさしく香ばしいシャンの郷土料理。',
    image: '/tofu-nway.png',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'bread',label:'အီကြာကွေး / 揚げパン',price:150},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'tofu',label:'တိုဖူးနွေးအပို / ひよこ豆豆腐追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100}] },
  { id: 4, mm: 'အုန်းနို့ခေါက်ဆွဲ', jp: 'オンノカウスエ', price: 950, category: 'noodle', popular: true,
    description: 'ココナッツミルクのコクと鶏肉の旨みが広がる、クリーミーな麺料理。',
    image: '/ohn-no-khao-swe.png',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'crispy',label:'အကြွပ်ခေါက်ဆွဲ / 揚げ麺追加',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 5, mm: 'ကြေးအိုး', jp: 'チェーオー', price: 950, category: 'noodle', popular: true,
    description: '豚肉団子と野菜、米麺を楽しむ、澄んだスープのミャンマー定番麺。',
    image: '/kyay-oh.png',
    optionTitle: 'အမျိုးအစားရွေးပါ / 種類を選択', defaultOption: 'soup', defaultSpice: 'none',
    options: [{id:'soup',label:'အရည် / スープ',price:0},{id:'oil',label:'ဆီချက် / 汁なし・油和え',price:0}],
    toppings: [{id:'meatball',label:'ဝက်သားလုံးအပို / 豚肉団子追加',price:200},{id:'pork',label:'ဝက်သားအပို / 豚肉追加',price:200},{id:'quail',label:'ငုံးဥအပို / うずら卵追加',price:100},{id:'greens',label:'အစိမ်းရွက်အပို / 青菜追加',price:100},{id:'noodle',label:'ကြာဆံအပို / 麺追加',price:150}] },
  { id: 6, mm: 'နန်းကြီးသုပ်', jp: 'ナンジートゥ', price: 900, category: 'noodle', popular: true,
    description: '太い米麺に鶏肉とひよこ豆粉を絡めた、コクのある和え麺。',
    image: '/nan-gyi-thoke.png',
    optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:200},{id:'onion',label:'ကြက်သွန်ကြော် / フライドオニオン',price:100},{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150}] },
  { id: 7, mm: 'ကြက်သားဒံပေါက်', jp: 'チキンダンバウ', price: 1100, category: 'curry', popular: true,
    description: '香り高いスパイスで炊いたご飯に、やわらかな鶏肉を合わせたミャンマー式ビリヤニ。',
    image: '/chicken-danbauk.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:250}],
    toppings: [{id:'egg',label:'ကြက်ဥပြုတ် / ゆで卵',price:100},{id:'chicken',label:'ကြက်သားအပို / 鶏肉追加',price:250},{id:'rice',label:'ထမင်းအပို / ライス追加',price:150},{id:'salad',label:'သုပ်အပို / サラダ追加',price:150}] },
  { id: 8, mm: 'ဇလုံထမင်းနယ်', jp: 'ミャンマー風混ぜご飯', price: 950, category: 'curry', popular: true,
    description: 'ご飯とおかず、野菜を大きな器で混ぜ合わせて楽しむ、家庭的な一皿。',
    image: '/myanmar-mixed-rice.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    secondaryTitle: 'အဓိကဟင်းရွေးပါ / メインを選択', defaultSecondary: 'chicken',
    secondaryOptions: [{id:'chicken',label:'ကြက်သား / 鶏肉',price:0},{id:'fish',label:'ငါး / 魚',price:0},{id:'egg',label:'ကြက်ဥ / 卵',price:0},{id:'vegetable',label:'အသီးအရွက် / 野菜',price:0}],
    toppings: [{id:'egg',label:'ကြက်ဥ / ゆで卵',price:100},{id:'vegetable',label:'ဟင်းသီးဟင်းရွက်အပို / 野菜追加',price:150},{id:'dried-fish',label:'ငါးခြောက်ကြော် / 干し魚炒め',price:200}] },
  { id: 9, mm: 'ပဲပြုတ်ထမင်း', jp: 'ゆで豆ご飯', price: 750, category: 'curry', popular: true,
    description: 'やわらかく茹でた豆とご飯を香味油で和えた、シンプルで滋味深い定番ごはん。',
    image: '/boiled-bean-rice.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:150}],
    secondaryTitle: 'အရသာရွေးပါ / 味を選択', defaultSecondary: 'normal',
    secondaryOptions: [{id:'normal',label:'ပုံမှန် / 普通',price:0},{id:'less-oil',label:'ဆီနည်း / 油少なめ',price:0},{id:'less-salt',label:'ဆားနည်း / 塩少なめ',price:0}],
    toppings: [{id:'fried-egg',label:'ကြက်ဥကြော် / 目玉焼き',price:150},{id:'beans',label:'ပဲပြုတ်အပို / ゆで豆追加',price:100},{id:'dried-fish',label:'ငါးခြောက်ကြော် / 干し魚炒め',price:200},{id:'rice',label:'ထမင်းအပို / ライス追加',price:150}] },
  { id: 10, mm: 'မြန်မာကြက်သားဟင်း', jp: 'ミャンマー風チキンカレー', price: 900, category: 'curry', popular: true,
    description: '玉ねぎとスパイスをじっくり煮込んだ、鶏肉の旨みたっぷりのミャンマーカレー。',
    image: '/myanmar-chicken-curry.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'extra-chicken',label:'ကြက်သားအပို / 鶏肉大盛り',price:250}],
    toppings: [{id:'rice',label:'ထမင်း / ライス',price:200},{id:'potato',label:'အာလူးအပို / じゃがいも追加',price:100},{id:'sauce',label:'ဟင်းရည်အပို / カレーソース追加',price:100}] },
  { id: 11, mm: 'မြန်မာငါးဟင်း', jp: 'ミャンマー風魚料理', price: 1000, category: 'curry', popular: true,
    description: '魚の旨みを生かした、香り豊かなミャンマーの家庭料理。',
    image: '/myanmar-fish-curry.png', optionTitle: 'ချက်ပြုတ်ပုံရွေးပါ / 調理方法を選択', defaultOption: 'curry', defaultSpice: 'mild', spiceTitle: 'အရသာရွေးပါ / 味を選択',
    flavors: [{id:'sweet',label:'အချို / 甘口'},{id:'mild',label:'အနည်းငယ်စပ် / ひかえめ'},{id:'normal',label:'ပုံမှန်စပ် / 普通'},{id:'hot',label:'အစပ် / 辛口'}],
    options: [{id:'curry',label:'ငါးဟင်းချက် / 魚カレー',price:0},{id:'fried',label:'ငါးကြော် / 魚の唐揚げ',price:0}],
    toppings: [{id:'rice',label:'ထမင်း / ライス',price:200},{id:'fish',label:'ငါးအပို / 魚追加',price:300},{id:'sauce',label:'ဟင်းရည်အပို / ソース追加',price:100}] },
  { id: 12, mm: 'အသည်းပန်းဂေါ်ဖီကြော်', jp: 'レバーとカリフラワー炒め', price: 850, category: 'curry', popular: true,
    description: 'コクのあるレバーと歯ざわりの良いカリフラワーを香ばしく炒めました。',
    image: '/liver-cauliflower.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'liver',label:'အသည်းအပို / レバー追加',price:200},{id:'cauliflower',label:'ပန်းဂေါ်ဖီအပို / カリフラワー追加',price:100},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 13, mm: 'ကြက်ဟင်းခါးသီးကြက်ဥကြော်', jp: 'ゴーヤと卵炒め', price: 750, category: 'curry', popular: true,
    description: 'ゴーヤのほろ苦さをふんわり卵が包む、やさしい味わいの炒め物。',
    image: '/bitter-melon-egg.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'none',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:200}],
    toppings: [{id:'egg',label:'ကြက်ဥအပို / 卵追加',price:100},{id:'goya',label:'ကြက်ဟင်းခါးသီးအပို / ゴーヤ追加',price:150},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 14, mm: 'ငပိရည်ကြိုတို့စရာဗန်း', jp: 'ミャンマー風発酵魚ディップと野菜の盛り合わせ', price: 850, category: 'curry', popular: true,
    description: '発酵魚の深い旨みを楽しむディップと、彩り豊かな野菜の盛り合わせ。',
    image: '/ngapi-dip-platter.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:500}],
    toppings: [{id:'vegetable',label:'ဟင်းသီးဟင်းရွက်အပို / 野菜追加',price:200},{id:'dip',label:'ငပိရည်ကြိုအပို / ディップ追加',price:150},{id:'okra',label:'ရုံးပတီသီးအပို / オクラ追加',price:100},{id:'cucumber',label:'သခွားသီးအပို / きゅうり追加',price:100}] },
  { id: 15, mm: 'အစပ်ငါးခြောက်ကြော်', jp: 'ピリ辛干し魚炒め', price: 600, category: 'curry', popular: true,
    description: '干し魚と香味野菜を香ばしく炒めた、ご飯がすすむピリ辛の一品。',
    image: '/spicy-dried-fish.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'small', defaultSpice: 'mild',
    options: [{id:'small',label:'အသေး / 小',price:0},{id:'large',label:'အကြီး / 大',price:250}],
    toppings: [{id:'fish',label:'ငါးခြောက်အပို / 干し魚追加',price:200},{id:'onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'rice',label:'ထမင်း / ライス',price:200}] },
  { id: 16, mm: 'မြန်မာမုန့်အစုံ', jp: 'ミャンマー菓子盛り合わせ', price: 800, category: 'snack', popular: true,
    description: 'ミャンマーの伝統菓子を少しずつ楽しめる、彩り豊かな盛り合わせ。',
    image: '/myanmar-dessert-platter.png', optionTitle: 'မုန့်အရေအတွက်ရွေးပါ / 種類数を選択', defaultOption: 'three', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'three',label:'သုံးမျိုး / 3種類',price:0},{id:'five',label:'ငါးမျိုး / 5種類',price:400}],
    multiTitle: 'ကြိုက်နှစ်သက်သောမုန့်ရွေးပါ / お菓子を選択', selectionLimit: {three:3,five:5},
    multiOptions: [{id:'semolina',label:'ဆနွင်းမကင်း / セモリナケーキ'},{id:'jelly',label:'ကျောက်ကျော / ミャンマー風ゼリー'},{id:'donut',label:'မုန့်လက်ကောက် / リングドーナツ'},{id:'steamed-cake',label:'မုန့်ပေါင်း / 蒸し菓子'},{id:'sticky-rice',label:'ကောက်ညှင်းပေါင်း / 蒸しもち米'},{id:'tapioca',label:'အုန်းနို့သာကူ / ココナッツミルクタピオカ'}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 17, mm: 'ဂျင်းသုပ်', jp: 'ミャンマー風生姜サラダ', price: 650, category: 'salad', popular: true,
    description: '香り豊かな生姜に豆や干しエビを合わせた、爽やかで食感の楽しいミャンマーサラダ。',
    image: '/ginger-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'ginger',label:'ဂျင်းအပို / 生姜追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 18, mm: 'ပဲဂေါ်ဖီသုပ်', jp: '豆とキャベツのサラダ', price: 600, category: 'salad', popular: true,
    description: '豆の香ばしさとキャベツの歯ざわりを楽しむ、軽やかなミャンマー風サラダ。',
    image: '/bean-cabbage-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'cabbage',label:'ဂေါ်ဖီအပို / キャベツ追加',price:100}] },
  { id: 19, mm: 'သရက်သီးသုပ်', jp: 'ミャンマー風青マンゴーサラダ', price: 650, category: 'salad', popular: true,
    description: '青マンゴーの酸味と香辛料が重なる、さっぱりとしたミャンマー定番サラダ。',
    image: '/green-mango-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'mango',label:'သရက်သီးအပို / 青マンゴー追加',price:150},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 20, mm: 'မုန့်လုံး', jp: 'ココナッツもち団子', price: 500, category: 'snack', popular: true,
    description: 'もちもちの団子にココナッツをたっぷりまとわせた、やさしい甘さの伝統菓子。',
    image: '/coconut-mochi-balls.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'five', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'five',label:'၅ လုံး / 5個',price:0},{id:'eight',label:'၈ လုံး / 8個',price:250},{id:'twelve',label:'၁၂ လုံး / 12個',price:500}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ်အပို / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 21, mm: 'ပဲပလာတာ', jp: '豆カレーとパラタ', price: 750, category: 'snack', popular: true,
    description: '香ばしく焼いたパラタを、まろやかな豆カレーと一緒に楽しむ定番の軽食。',
    image: '/bean-curry-parata.png', optionTitle: 'ပလာတာအရေအတွက်ရွေးပါ / パラタの枚数を選択', defaultOption: 'one', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'one',label:'၁ ချပ် / 1枚',price:0},{id:'two',label:'၂ ချပ် / 2枚',price:250},{id:'three',label:'၃ ချပ် / 3枚',price:450}],
    toppings: [{id:'bean-curry',label:'ပဲဟင်းအပို / 豆カレー追加',price:200},{id:'parata',label:'ပလာတာအပို / パラタ追加',price:250},{id:'fried-onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'egg',label:'ကြက်ဥ / 卵',price:150}] },
  { id: 22, mm: 'ကြာဆံဟင်းခါး', jp: 'ミャンマー風春雨スープ', price: 800, category: 'noodle', popular: true,
    description: '春雨と鶏もみじ、きのこの旨みを重ねた、体が温まるミャンマー風スープ。',
    image: '/glass-noodle-soup.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:300}],
    toppings: [{id:'vermicelli',label:'ကြာဆံအပို / 春雨追加',price:150},{id:'chicken-feet',label:'ကြက်ခြေထောက်အပို / 鶏もみじ追加',price:250},{id:'egg',label:'ကြက်ဥ / 卵',price:150},{id:'mushroom',label:'မှိုအပို / きのこ追加',price:150},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 23, mm: 'ရှမ်းတိုဖူးသုပ်', jp: 'シャン豆腐サラダ', price: 650, category: 'salad', popular: true,
    description: 'なめらかなシャン豆腐を香味野菜と和えた、香ばしく爽やかなサラダ。',
    image: '/shan-tofu-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:400}],
    toppings: [{id:'shan-tofu',label:'ရှမ်းတိုဖူးအပို / シャン豆腐追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-onion',label:'ကြက်သွန်ကြော်အပို / フライドオニオン追加',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 24, mm: 'ပေါက်စီ', jp: 'ミャンマー風肉まん', price: 350, category: 'snack', popular: true,
    description: 'ふんわり蒸した生地で選べる具材を包んだ、ミャンマーで親しまれる肉まん。',
    image: '/myanmar-steamed-bun.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'one', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'one',label:'၁ လုံး / 1個',price:0},{id:'two',label:'၂ လုံး / 2個',price:300},{id:'three',label:'၃ လုံး / 3個',price:550}],
    secondaryTitle: 'အဆာရွေးပါ / 具材を選択', defaultSecondary: 'chicken',
    secondaryOptions: [{id:'chicken',label:'ကြက်သား / 鶏肉',price:0},{id:'pork',label:'ဝက်သား / 豚肉',price:0},{id:'vegetable',label:'ဟင်းသီးဟင်းရွက် / 野菜',price:0}],
    toppings: [{id:'egg-filling',label:'ကြက်ဥအဆာ / 卵入り',price:100},{id:'extra-meat',label:'အသားအပို / 肉増量',price:150},{id:'chili-sauce',label:'ချီလီဆော့စ် / チリソース',price:50}] },
  { id: 25, mm: 'အီကြာကွေး', jp: '揚げパン（油条）', price: 400, category: 'snack', popular: true,
    description: '外はさっくり、中はふんわり。朝食やスープのお供に人気の揚げパン。',
    image: '/fried-bread.png', optionTitle: 'အရေအတွက်ရွေးပါ / 本数を選択', defaultOption: 'two', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'two',label:'၂ ချောင်း / 2本',price:0},{id:'four',label:'၄ ချောင်း / 4本',price:300},{id:'six',label:'၆ ချောင်း / 6本',price:550}],
    secondaryTitle: 'စားသုံးပုံရွေးပါ / 食べ方を選択', defaultSecondary: 'plain',
    secondaryOptions: [{id:'plain',label:'ရိုးရိုး / そのまま',price:0},{id:'condensed-milk',label:'နို့ဆီနှင့် / 練乳付き',price:100},{id:'bean-curry',label:'ပဲဟင်းနှင့် / 豆カレー付き',price:200}],
    toppings: [{id:'condensed-milk',label:'နို့ဆီအပို / 練乳追加',price:100},{id:'sugar',label:'သကြား / 砂糖',price:50},{id:'bean-curry',label:'ပဲဟင်းအပို / 豆カレー追加',price:200}] },
  { id: 26, mm: 'အချိုလက်ဖက်သုပ်', jp: '甘口ラペットゥ', price: 700, category: 'salad', popular: true,
    description: '発酵茶葉の風味をやさしい味わいに仕上げた、辛さ控えめのラペットゥ。',
    image: '/sweet-lahpet-thoke.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'none',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:450}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50}] },
  { id: 27, mm: 'လက်ဖက်အစုံသုပ်', jp: 'ミックス・ラペットゥ', price: 800, category: 'salad', popular: true,
    description: '発酵茶葉に豆、干しエビ、野菜を合わせた、食感豊かなミックスサラダ。',
    image: '/mixed-lahpet-thoke.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'mild',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:500}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100}] },
  { id: 28, mm: 'လက်ဖက်ထမင်း', jp: 'ラペッタミン', price: 850, category: 'curry', popular: true,
    description: '発酵茶葉の香りをご飯に混ぜ込み、豆や香味素材を合わせたミャンマーの茶葉ごはん。',
    image: '/lahpet-rice.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'mild',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large-rice',label:'ထမင်းအကြီး / ご飯大盛り',price:200}],
    secondaryTitle: 'ကြက်ဥရွေးပါ / 卵を選択', defaultSecondary: 'no-egg',
    secondaryOptions: [{id:'no-egg',label:'ကြက်ဥမပါ / 卵なし',price:0},{id:'fried-egg',label:'ကြက်ဥကြော် / 目玉焼き',price:150},{id:'boiled-egg',label:'ကြက်ဥပြုတ် / ゆで卵',price:150}],
    toppings: [{id:'tea-leaf',label:'လက်ဖက်အပို / 発酵茶葉追加',price:150},{id:'fried-beans',label:'ပဲကြော်အပို / 揚げ豆追加',price:100},{id:'peanut',label:'မြေပဲအပို / ピーナッツ追加',price:100},{id:'fried-garlic',label:'ကြက်သွန်ဖြူကြော်အပို / フライドガーリック追加',price:100},{id:'rice',label:'ထမင်းအပို / ライス追加',price:200}] },
  { id: 29, mm: 'ရခိုင်သုပ်', jp: 'ラカイン風ライスヌードルサラダ', price: 750, category: 'salad', popular: true,
    description: '魚の旨みと香味野菜を米麺に絡めた、爽やかな辛さのラカイン風サラダ。',
    image: '/rakhine-rice-noodle-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'regular', defaultSpice: 'normal',
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大盛り',price:250}],
    toppings: [{id:'noodle',label:'ခေါက်ဆွဲအပို / 麺追加',price:150},{id:'fish-ball',label:'ငါးဖယ်အပို / 魚団子追加',price:200},{id:'onion',label:'ကြက်သွန်နီအပို / 玉ねぎ追加',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
  { id: 30, mm: 'ရွှေထမင်း', jp: 'シュエタミン', price: 550, category: 'snack', popular: true,
    description: 'もち米をココナッツと甘く炊き上げた、もっちり香ばしいミャンマー菓子。',
    image: '/shwe-htamin.png', optionTitle: 'ပမာဏရွေးပါ / 個数を選択', defaultOption: 'four', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'four',label:'၄ တုံး / 4個',price:0},{id:'six',label:'၆ တုံး / 6個',price:200},{id:'eight',label:'၈ တုံး / 8個',price:350}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 31, mm: 'မုန့်သိုင်းခြုံ', jp: 'モン・タイン・チョン', price: 600, category: 'snack', popular: true,
    description: '薄く焼いた生地でココナッツや豆あんを包む、やさしい甘さの伝統菓子。',
    image: '/mont-thaing-chon.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'two', defaultSpice: 'not-applicable', hideSpice: true,
    options: [{id:'two',label:'၂ ခု / 2個',price:0},{id:'four',label:'၄ ခု / 4個',price:350},{id:'six',label:'၆ ခု / 6個',price:650}],
    secondaryTitle: 'အဆာရွေးပါ / 中身を選択', defaultSecondary: 'coconut',
    secondaryOptions: [{id:'coconut',label:'အုန်းသီးအဆာ / ココナッツ',price:0},{id:'coconut-palm',label:'အုန်းသီးနှင့်ထန်းလျက် / ココナッツ＆パームシュガー',price:0},{id:'bean',label:'ပဲအဆာ / 豆あん',price:0}],
    toppings: [{id:'coconut',label:'အုန်းသီးဖတ်အပို / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်းအပို / ごま追加',price:50},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 32, mm: 'မုန့်လက်ဆောင်း', jp: 'モン・レット・サウン', price: 550, category: 'drink', popular: true,
    description: 'ゼリー麺とココナッツミルク、黒糖シロップを重ねた涼やかなデザート。',
    image: '/mont-let-saung.png', optionTitle: 'အရွယ်အစားရွေးပါ / サイズを選択', defaultOption: 'regular', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'regular',label:'ပုံမှန် / 普通',price:0},{id:'large',label:'အကြီး / 大',price:200}],
    secondaryTitle: 'ရေခဲရွေးပါ / 氷を選択', defaultSecondary: 'with-ice',
    secondaryOptions: [{id:'no-ice',label:'ရေခဲမပါ / 氷なし',price:0},{id:'with-ice',label:'ရေခဲပါ / 氷あり',price:0},{id:'extra-ice',label:'ရေခဲအပို / 氷多め',price:0}],
    toppings: [{id:'jelly-noodle',label:'မုန့်လက်ဆောင်းဖတ်အပို / ゼリー麺追加',price:100},{id:'coconut-milk',label:'အုန်းနို့အပို / ココナッツミルク追加',price:100},{id:'palm-sugar',label:'ထန်းလျက်ရည်အပို / パームシュガーシロップ追加',price:100},{id:'puffed-rice',label:'ဆန်ပေါက်အပို / ポン菓子追加',price:100}] },
  { id: 33, mm: 'မုန့်ကျွဲသည်း', jp: 'モン・チュエテー', price: 500, category: 'snack', popular: true,
    description: '黒糖の深い甘みともっちりした食感を楽しむ、素朴なミャンマー伝統菓子。',
    image: '/mont-kywe-the.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'five', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'five',label:'၅ တုံး / 5個',price:0},{id:'eight',label:'၈ တုံး / 8個',price:250},{id:'twelve',label:'၁၂ တုံး / 12個',price:500}],
    toppings: [{id:'poppy',label:'ဘိန်းစေ့အပို / けしの実追加',price:50},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'palm-sugar',label:'ထန်းလျက်ရည် / パームシュガーソース',price:100}] },
  { id: 34, mm: 'ဆနွင်းမကင်း', jp: 'ミャンマー風セモリナケーキ', price: 550, category: 'snack', popular: true,
    description: 'セモリナとココナッツの濃厚な風味を楽しむ、しっとりしたミャンマーケーキ。',
    image: '/semolina-cake.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'two', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'two',label:'၂ တုံး / 2個',price:0},{id:'four',label:'၄ တုံး / 4個',price:300},{id:'six',label:'၆ တုံး / 6個',price:550}],
    toppings: [{id:'poppy',label:'ဘိန်းစေ့အပို / けしの実追加',price:50},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50}] },
  { id: 35, mm: 'ထိုးမုန့်', jp: 'トーモン', price: 550, category: 'snack', popular: true,
    description: 'ココナッツの香りともちもち食感が広がる、ひと口サイズのミャンマー菓子。',
    image: '/toh-mont.png', optionTitle: 'အရေအတွက်ရွေးပါ / 個数を選択', defaultOption: 'three', defaultSpice: 'normal', spiceTitle: 'အချိုအဆင့်ရွေးပါ / 甘さを選択',
    flavors: [{id:'less',label:'အချိုလျှော့ / 甘さひかえめ'},{id:'normal',label:'ပုံမှန်အချို / 普通'},{id:'sweet',label:'အချိုပို / 甘め'}],
    options: [{id:'three',label:'၃ တုံး / 3個',price:0},{id:'six',label:'၆ တုံး / 6個',price:300},{id:'nine',label:'၉ တုံး / 9個',price:550}],
    toppings: [{id:'roasted-coconut',label:'အုန်းသီးကြော်အပို / ローストココナッツ追加',price:100},{id:'coconut',label:'အုန်းသီးဖတ် / ココナッツ追加',price:100},{id:'sesame',label:'နှမ်း / ごま追加',price:50}] },
  { id: 36, mm: 'သင်္ဘောသီးထောင်း', jp: '青パパイヤサラダ', price: 700, category: 'salad', popular: true,
    description: '青パパイヤの歯ざわりとライムの酸味を生かした、爽快なピリ辛サラダ。',
    image: '/green-papaya-salad.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'one', defaultSpice: 'normal',
    options: [{id:'one',label:'တစ်ယောက်စာ / 1人前',price:0},{id:'two',label:'နှစ်ယောက်စာ / 2人前',price:450}],
    toppings: [{id:'papaya',label:'သင်္ဘောသီးအပို / 青パパイヤ追加',price:150},{id:'tomato',label:'ခရမ်းချဉ်သီးအပို / トマト追加',price:100},{id:'green-bean',label:'ပဲတောင့်ရှည်အပို / インゲン追加',price:100},{id:'dried-shrimp',label:'ပုစွန်ခြောက်အပို / 干しエビ追加',price:150},{id:'lime',label:'သံပရာအပို / ライム追加',price:100}] },
  { id: 37, mm: 'တိုဖူးကြော်', jp: '揚げシャン豆腐', price: 600, category: 'snack', popular: true,
    description: '外はカリッと中はなめらか。シャン豆腐を香ばしく揚げた人気のおつまみ。',
    image: '/fried-shan-tofu.png', optionTitle: 'ပမာဏရွေးပါ / 量を選択', defaultOption: 'small', defaultSpice: 'mild',
    options: [{id:'small',label:'အသေး / 小',price:0},{id:'large',label:'အကြီး / 大',price:300}],
    secondaryTitle: 'ဆော့စ်ရွေးပါ / ソースを選択', defaultSecondary: 'sweet-spicy',
    secondaryOptions: [{id:'sweet-spicy',label:'ချဉ်စပ်ဆော့စ် / 甘酸っぱいピリ辛ソース',price:0},{id:'sweet',label:'အချိုဆော့စ် / スイートソース',price:0},{id:'none',label:'ဆော့စ်မပါ / ソースなし',price:0}],
    toppings: [{id:'fried-tofu',label:'တိုဖူးကြော်အပို / 揚げ豆腐追加',price:200},{id:'sauce',label:'ဆော့စ်အပို / ソース追加',price:100},{id:'peanut-powder',label:'မြေပဲအမှုန့် / ピーナッツパウダー',price:100},{id:'coriander',label:'နံနံပင်အပို / パクチー追加',price:100}] },
];

const yen = (value: number) => '¥' + value.toLocaleString('ja-JP');

export default function Home() {
  const [language, setLanguage] = useState<'jp' | 'mm'>('jp');
  const [activeTab, setActiveTab] = useState('home');
  const [category, setCategory] = useState('popular');
  const [query, setQuery] = useState('');
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
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([2]);
  const [toast, setToast] = useState('');

  const filteredFoods = useMemo(() => {
    const list = category === 'popular' ? foods.filter((food) => food.popular) : foods.filter((food) => food.category === category);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return foods.filter((food) => (food.jp + ' ' + food.mm).toLowerCase().includes(q));
  }, [category, query]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const fee = method === 'delivery' && cart.length ? 300 : 0;
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
    setSelected(food);
    setDetailQty(1);
    setDetailOption(food.defaultOption || null);
    setDetailSpice(food.defaultSpice || null);
    setDetailSecondary(food.defaultSecondary || null);
    setDetailMulti([]);
    setDetailToppings([]);
    setDetailNote('');
  };
  const addSelected = () => {
    if (!selected || !detailOption || !detailSpice || !requiredComplete) return;
    const optionPrice = selected.options.find((option) => option.id === detailOption)?.price || 0;
    const secondaryPrice = selected.secondaryOptions?.find((option) => option.id === detailSecondary)?.price || 0;
    const toppingPrice = selected.toppings.filter((topping) => detailToppings.includes(topping.id)).reduce((sum, topping) => sum + topping.price, 0);
    const unitPrice = selected.price + optionPrice + secondaryPrice + toppingPrice;
    setCart((items) => {
      const toppingKey = detailToppings.slice().sort().join(',');
      const multiKey = detailMulti.slice().sort().join(',');
      const found = items.findIndex((item) => item.id === selected.id && item.selectedOption === detailOption && item.selectedSpice === detailSpice && item.selectedSecondary === (detailSecondary || '') && item.selectedMulti.slice().sort().join(',') === multiKey && item.selectedToppings.slice().sort().join(',') === toppingKey && item.note === detailNote);
      if (found < 0) return items.concat([{ ...selected, quantity: detailQty, selectedOption: detailOption, selectedSpice: detailSpice, selectedSecondary: detailSecondary || '', selectedMulti: detailMulti, selectedToppings: detailToppings, note: detailNote, unitPrice }]);
      return items.map((item, index) => index === found ? { ...item, quantity: item.quantity + detailQty } : item);
    });
    setSelected(null);
    flash(language === 'jp' ? 'カートに追加しました' : 'ခြင်းထဲသို့ ထည့်ပြီးပါပြီ');
  };
  const goTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'cart') setShowCart(true);
    if (tab === 'orders') setTracking(true);
    if (tab === 'menu') document.getElementById('menu')?.scrollIntoView();
  };

  return (
    <main className='app-shell'>
      <header className='topbar'>
        <button className='brand' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>MYANMAR RESTRUANT</small></div></button>
        <div className='header-location'><span className='pin'>●</span><div><small>お届け先</small><strong>沖縄県 那覇市 泉崎 1-1</strong></div><span>⌄</span></div>
        <div className='header-actions'>
          <button className='language' onClick={() => setLanguage(language === 'jp' ? 'mm' : 'jp')}><span>{language === 'jp' ? 'JP' : 'MM'}</span>{language === 'jp' ? '日本語' : 'မြန်မာ'}</button>
          <button className='round' aria-label='Notifications'>♢<span className='alert-dot'/></button>
          <button className='profile' onClick={() => goTab('mypage')}><span>G</span><div><small>Guest</small><strong>注文情報</strong></div></button>
        </div>
      </header>

      <section className='hero'>
        <div className='hero-copy'>
          <p className='eyebrow'>AUTHENTIC MYANMAR FLAVORS</p>
          <h1>{language === 'jp' ? <>今日は、何を<br/><em>食べますか？</em></> : <>ဒီနေ့ ဘာစား<br/><em>ချင်ပါသလဲ?</em></>}</h1>
          <p>{language === 'jp' ? '故郷の味を、那覇のあなたの食卓へ。' : 'မြန်မာ့အရသာကို နာဟာမြို့က သင့်အိမ်အရောက်။'}</p>
          <div className='search-box'><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'jp' ? '料理名を検索…' : 'အစားအစာရှာရန်…'}/><button>検索</button></div>
        </div>
        <div className='hero-image'>
          <img src={foods[0].image} alt='Mohinga, traditional Myanmar noodle soup'/>
          <div className='hero-badge'><b>4.9</b><span>★ ★ ★ ★ ★<br/><small>1,240 reviews</small></span></div>
          <div className='hero-caption'><small>TODAY&apos;S PICK</small><strong>မုန့်ဟင်းခါး</strong><span>モヒンガー</span></div>
        </div>
      </section>

      <section className='control-strip'>
        <div className='method-switch'>
          <button className={method === 'delivery' ? 'active' : ''} onClick={() => setMethod('delivery')}><span>◈</span><div><b>Delivery</b><small>30–45 min</small></div></button>
          <button className={method === 'pickup' ? 'active' : ''} onClick={() => setMethod('pickup')}><span>▣</span><div><b>Pickup</b><small>15–20 min</small></div></button>
        </div>
        <p><span>●</span> ただいま注文受付中 <small>・ ¥2,000以上で配送料無料</small></p>
      </section>

      <section className='content-section' id='menu'>
        <div className='section-heading'><div><p className='eyebrow'>EXPLORE OUR MENU</p><h2>{language === 'jp' ? 'カテゴリー' : 'အမျိုးအစားများ'}</h2></div><button className='view-all' onClick={() => setCategory('popular')}>すべて見る <span>→</span></button></div>
        <div className='categories'>
          {categories.map((item) => <button key={item.id} onClick={() => setCategory(item.id)} className={category === item.id ? 'active' : ''}><span>{item.icon}</span><strong>{item.jp}</strong><small>{item.mm}</small></button>)}
        </div>
      </section>

      <section className='content-section menu-section'>
        <div className='section-heading'><div><p className='eyebrow'>CHEF&apos;S SELECTION</p><h2>{categories.find((item) => item.id === category)?.jp}</h2></div><div className='filters'><button className='active'>おすすめ順</button><button onClick={() => flash('辛さ・価格・アレルギーで絞り込み')}>⚙ 絞り込み</button></div></div>
        {filteredFoods.length ? <div className='food-grid'>
          {filteredFoods.map((food) => <article className='food-card' key={food.id}>
            <button className={'heart ' + (favorites.includes(food.id) ? 'liked' : '')} aria-label='Favorite' onClick={() => setFavorites((list) => list.includes(food.id) ? list.filter((id) => id !== food.id) : list.concat(food.id))}>♥</button>
            <button className='food-image' onClick={() => openFood(food)}>{food.image ? <img src={food.image} alt={food.jp}/> : <span className='food-placeholder'><b>Ⴙ</b><small>{food.mm}<br/>{food.jp}</small></span>}{food.special && <span className='special-badge'>TODAY&apos;S SPECIAL</span>}</button>
            <div className='food-info'><div className='food-title'><div><small>{food.mm}</small><h3>{food.jp}</h3></div><span className='spicy'>辛さ選択</span></div><p>{food.description}</p><div className='food-bottom'><strong>{yen(food.price)}</strong><button onClick={() => openFood(food)}>＋ 選ぶ</button></div></div>
          </article>)}
        </div> : <div className='empty-state'><span>⌕</span><h3>料理が見つかりません</h3><button onClick={() => setQuery('')}>検索をクリア</button></div>}
      </section>

      <section className='promo-banner'>
        <div><p className='eyebrow light'>WEEKEND SPECIAL</p><h2>家族の食卓に、<br/>もっとミャンマーを。</h2><p>カレー2品・ライス・サラダ・ドリンクのお得なセット</p><button onClick={() => openFood(foods[2])}>セットを見る →</button></div>
        <div className='promo-price'><small>FAMILY SET</small><strong>¥3,800</strong><span>通常 ¥4,600</span></div>
      </section>

      <footer><div className='brand inverted'><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>MYANMAR RESTRUANT</small><span className='brand-tagline'>那覇で楽しむ、本格ミャンマー料理。</span></div></div><div><span>営業時間 11:00–22:00</span><a href='mailto:home@gmail.com'>home@gmail.com</a><a href='tel:09012340000'>090-1234-0000</a></div></footer>

      <nav className='bottom-nav' aria-label='Main navigation'>
        {[['home','⌂','ホーム'],['menu','≡','メニュー'],['cart','◇','カート'],['orders','◴','注文'],['mypage','○','注文情報']].map((item) => <button key={item[0]} className={activeTab === item[0] ? 'active' : ''} onClick={() => goTab(item[0])}><span>{item[1]}{item[0] === 'cart' && cartCount > 0 && <b>{cartCount}</b>}</span><small>{item[2]}</small></button>)}
      </nav>

      {selected && <div className='modal-layer' onMouseDown={(event) => event.currentTarget === event.target && setSelected(null)}>
        <div className='detail-drawer'>
          <button className='modal-close' onClick={() => setSelected(null)}>×</button>
          <div className='detail-photo'>{selected.image ? <img src={selected.image} alt={selected.jp}/> : <div className='detail-placeholder'><b>Ⴙ</b><strong>{selected.mm}</strong><small>{selected.jp}</small></div>}<span>{selected.category.toUpperCase()}</span></div>
          <div className='detail-content'>
            <p className='eyebrow'>FOOD DETAIL</p>
            <small className='mm-name'>{selected.mm}</small>
            <h2>{selected.jp}</h2>
            <strong className='detail-base-price'>{yen(selected.price)}</strong>
            <p className='detail-desc'>{selected.description}</p>

            <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.optionTitle}</strong><span>（必須）</span></div>
              <div className='choice-list'>
                {selected.options.map((option) => <label className={detailOption === option.id ? 'selected' : ''} key={option.id}>
                  <input type='radio' name='food-option' checked={detailOption === option.id} onChange={() => setDetailOption(option.id)}/>
                  <span className='radio-mark'/><b>{option.label}</b>{option.price > 0 && <strong>+{yen(option.price)}</strong>}
                </label>)}
              </div>
              {selected.id === 5 && detailOption === 'oil' && <div className='soup-note'><b>ဟင်းရည်သီးခြားပါဝင်သည်</b><span>スープ付き</span></div>}
            </div>

            {selected.secondaryOptions && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.secondaryTitle}</strong><span>（必須）</span></div>
              <div className='choice-list'>
                {selected.secondaryOptions.map((option) => <label className={detailSecondary === option.id ? 'selected' : ''} key={option.id}>
                  <input type='radio' name='secondary-option' checked={detailSecondary === option.id} onChange={() => setDetailSecondary(option.id)}/>
                  <span className='radio-mark'/><b>{option.label}</b>{option.price > 0 && <strong>+{yen(option.price)}</strong>}
                </label>)}
              </div>
            </div>}

            {!selected.hideSpice && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.spiceTitle || 'အစပ်အဆင့်ရွေးပါ / 辛さを選択'}</strong><span>（必須）</span></div>
              <div className='choice-list spice-list'>
                {(selected.flavors || spiceOptions).map((spice) => <label className={detailSpice === spice.id ? 'selected' : ''} key={spice.id}>
                  <input type='radio' name='spice-option' checked={detailSpice === spice.id} onChange={() => setDetailSpice(spice.id)}/>
                  <span className='radio-mark'/><b>{spice.label}</b>
                </label>)}
              </div>
            </div>}

            {selected.multiOptions && <div className='detail-option-block'>
              <div className='detail-option-title'><strong>{selected.multiTitle}</strong><span>（必須・複数選択可）</span></div>
              <p className='selection-counter'>{requiredMultiCount}種類を選択：<b>{detailMulti.length} / {requiredMultiCount}</b></p>
              <div className='choice-list topping-list'>
                {selected.multiOptions.map((option) => <label className={detailMulti.includes(option.id) ? 'selected' : ''} key={option.id}>
                  <input type='checkbox' checked={detailMulti.includes(option.id)} onChange={() => setDetailMulti((list) => list.includes(option.id) ? list.filter((id) => id !== option.id) : list.length < requiredMultiCount ? list.concat(option.id) : list)}/>
                  <span className='check-mark'/><b>{option.label}</b>
                </label>)}
              </div>
            </div>}

            <div className='detail-option-block'>
              <div className='detail-option-title'><strong>Topping ထပ်ထည့်ရန်</strong><span>（任意）</span></div>
              <div className='choice-list topping-list'>
                {selected.toppings.map((topping) => <label className={detailToppings.includes(topping.id) ? 'selected' : ''} key={topping.id}>
                  <input type='checkbox' checked={detailToppings.includes(topping.id)} onChange={() => setDetailToppings((list) => list.includes(topping.id) ? list.filter((id) => id !== topping.id) : list.concat(topping.id))}/>
                  <span className='check-mark'/><b>{topping.label}</b><strong>+{yen(topping.price)}</strong>
                </label>)}
              </div>
            </div>

            <label className='request-note'>
              <span><b>အထူးတောင်းဆိုချက်</b>（任意）</span>
              <small>ご要望・備考</small>
              <textarea value={detailNote} onChange={(event) => setDetailNote(event.target.value)} placeholder={'例：ကြက်သွန်နီမထည့်ပါနှင့်\n例：玉ねぎ抜き'}/>
            </label>

            <div className='detail-actions'>
              <div><span>အရေအတွက် / 数量</span><div className='quantity'><button onClick={() => setDetailQty(Math.max(1, detailQty - 1))}>−</button><b>{detailQty}</b><button onClick={() => setDetailQty(detailQty + 1)}>+</button></div></div>
              <button className='primary add-cart' disabled={!requiredComplete} onClick={addSelected}><span>{yen(detailUnitPrice * detailQty)}</span>カートに追加</button>
            </div>
            {!requiredComplete && <p className='required-warning'>必須項目を選択してください / မဖြစ်မနေ ရွေးချယ်ရန်</p>}
          </div>
        </div>
      </div>}

      {showCart && <div className='modal-layer right' onMouseDown={(event) => event.currentTarget === event.target && setShowCart(false)}><aside className='cart-drawer'>
        <div className='drawer-head'><div><p className='eyebrow'>YOUR ORDER</p><h2>カート <span>{cartCount}点</span></h2></div><button className='modal-close static' onClick={() => setShowCart(false)}>×</button></div>
        {cart.length ? <><div className='cart-list'>{cart.map((item, index) => <div className='cart-item' key={item.id + '-' + index}>
          {item.image ? <img src={item.image} alt=''/> : <span className='cart-placeholder'>Ⴙ</span>}
          <div><strong>{item.mm} / {item.jp}</strong>
            <small>{item.options.find((option) => option.id === item.selectedOption)?.label}{!item.hideSpice && ' · ' + (item.flavors || spiceOptions).find((spice) => spice.id === item.selectedSpice)?.label}</small>
            {item.secondaryOptions && <small>+ {item.secondaryOptions.find((option) => option.id === item.selectedSecondary)?.label}</small>}
            {item.selectedMulti.length > 0 && <small>+ {item.multiOptions?.filter((option) => item.selectedMulti.includes(option.id)).map((option) => option.label).join('、')}</small>}
            {item.selectedToppings.length > 0 && <small>+ {item.toppings.filter((topping) => item.selectedToppings.includes(topping.id)).map((topping) => topping.label).join('、')}</small>}
            {item.note && <small className='cart-note'>備考: {item.note}</small>}
            <div className='mini-quantity'><button onClick={() => setCart((items) => items.map((entry, i) => i === index ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button><span>{item.quantity}</span><button onClick={() => setCart((items) => items.map((entry, i) => i === index ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button></div>
          </div><div className='cart-price'><button onClick={() => setCart((items) => items.filter((_, i) => i !== index))}>×</button><strong>{yen(item.unitPrice * item.quantity)}</strong></div>
        </div>)}</div>
          <label className='coupon'><span>◇</span><input placeholder='クーポンコード'/><button>適用</button></label><textarea className='notes' placeholder='お店へのメモ（任意）'/>
          <div className='summary'><p><span>小計</span><b>{yen(subtotal)}</b></p><p><span>配送料</span><b>{fee ? yen(fee) : '無料'}</b></p><div><span>合計 <small>（税込）</small></span><strong>{yen(subtotal + fee)}</strong></div></div>
          <button className='primary wide checkout-button' onClick={() => { setShowCart(false); setCheckout(true); }}>レジに進む <span>→</span></button></> :
          <div className='cart-empty'><span>◇</span><h3>カートは空です</h3><p>お好きな料理を選んでください。</p><button className='primary' onClick={() => setShowCart(false)}>メニューを見る</button></div>}
      </aside></div>}

      {checkout && <div className='modal-layer'><div className='checkout-modal'><button className='modal-close' onClick={() => setCheckout(false)}>×</button>
        <div className='checkout-title'><p className='eyebrow'>CHECKOUT</p><h2>お届け情報</h2><p>အော်ဒါအချက်အလက်များ</p></div>
        <div className='checkout-grid'><div><h3>1. 受け取り方法</h3><div className='method-switch checkout-method'><button className={method === 'delivery' ? 'active' : ''} onClick={() => setMethod('delivery')}><span>◈</span><div><b>Delivery</b><small>ご指定の住所へ</small></div></button><button className={method === 'pickup' ? 'active' : ''} onClick={() => setMethod('pickup')}><span>▣</span><div><b>Pickup</b><small>お店で受け取り</small></div></button></div>
          <h3>2. お客様情報</h3><div className='form-grid'><label><span>お名前</span><input placeholder='例）アイ・タンダー'/></label><label><span>電話番号</span><input placeholder='090-1234-5678'/></label>{method === 'delivery' && <><label><span>郵便番号</span><input placeholder='900-0021'/></label><label className='full'><span>配達先住所</span><input placeholder='沖縄県那覇市泉崎 1-1-1'/></label></>}</div>
        </div><div className='payment-side'><h3>3. お支払い</h3>{['Credit Card','PayPay',method === 'delivery' ? 'Cash on delivery' : 'Pay at restaurant'].map((pay, i) => <label className={'payment ' + (i === 0 ? 'selected' : '')} key={pay}><input type='radio' name='payment' defaultChecked={i === 0}/><span>{i === 0 ? '▣' : i === 1 ? 'P' : '¥'}</span><b>{pay}</b></label>)}<div className='order-total'><p><span>商品合計</span><b>{yen(subtotal)}</b></p><p><span>配送料</span><b>{yen(fee)}</b></p><div><span>お支払い合計</span><strong>{yen(subtotal + fee)}</strong></div></div><button className='primary wide' onClick={() => { setCheckout(false); setTracking(true); setActiveTab('orders'); }}>{yen(subtotal + fee)}　注文を確定</button><small className='secure'>◇ 安全に暗号化されています</small></div></div>
      </div></div>}

      {tracking && <div className='modal-layer'><div className='tracking-card'><button className='modal-close' onClick={() => setTracking(false)}>×</button><div className='success-icon'>✓</div><p className='eyebrow'>ORDER #TK-0824</p><h2>ご注文を受け付けました</h2><p>အော်ဒါတင်ပြီးပါပြီ · 調理を始めています</p><div className='eta'><small>ESTIMATED DELIVERY</small><strong>35–40 <span>min</span></strong><div><i/></div></div><div className='timeline'><div className='done'><span>✓</span><div><b>Order received</b><small>注文受付　·　20:32</small></div></div><div className='current'><span>✦</span><div><b>Preparing</b><small>調理中　·　ただいま</small></div></div><div><span>○</span><div><b>Driver picked up</b><small>配達中</small></div></div><div><span>○</span><div><b>Delivered</b><small>配達完了</small></div></div></div><div className='driver'><span>KT</span><div><small>YOUR DRIVER</small><b>Ko Than · ★ 4.9</b></div><button>☎</button></div><button className='secondary wide' onClick={() => setTracking(false)}>ホームに戻る</button></div></div>}

      {activeTab === 'mypage' && <div className='modal-layer' onMouseDown={(event) => event.currentTarget === event.target && setActiveTab('home')}><div className='profile-modal'><button className='modal-close' onClick={() => setActiveTab('home')}>×</button><div className='profile-hero'><span>G</span><div><p className='eyebrow light'>GUEST ORDER</p><h2>ゲスト注文</h2><small>登録・パスワードなしでご利用いただけます</small></div></div><div className='profile-links'>{[['◈','配達先住所','Delivery Address'],['◴','注文状況','Current Order'],['♥','お気に入り',favorites.length + ' items'],['▣','支払い方法','Payment Methods'],['◎','言語設定','日本語 / မြန်မာ']].map((item) => <button key={item[1]}><span>{item[0]}</span><div><b>{item[1]}</b><small>{item[2]}</small></div><strong>›</strong></button>)}</div></div></div>}
      {toast && <div className='toast'><span>✓</span>{toast}</div>}
    </main>
  );
}
