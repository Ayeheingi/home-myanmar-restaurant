'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const customerSitePath = `${basePath}/`;

type Role = 'staff' | 'manager' | 'owner';
type Tab = 'orders' | 'staffshop' | 'inventory' | 'recipes' | 'purchases' | 'sales' | 'team';
type OrderStatus = '受付' | '調理中' | '受取待ち' | '完了';
type StaffSession = { email: string; name: string; role: Role };

const roles: { id: Role; label: string; sub: string }[] = [
  { id: 'staff', label: 'Staff', sub: '注文・従業員購入' },
  { id: 'manager', label: 'Manager', sub: '店舗運営・在庫管理' },
  { id: 'owner', label: 'Owner', sub: '売上・権限・全機能' },
];

const staffAccounts = [
  { email:'staff01@home-myanmar.jp', name:'Moe Moe', role:'staff' as Role, credentialHash:'c403fe2d5d4891e5fdedf37fcb0fe047f10a853873e353c16d0c80c9b6809108' },
  { email:'manager@home-myanmar.jp', name:'Aye Thandar', role:'manager' as Role, credentialHash:'4cb6013bede0e46bb4b2dba1cbfe59d298356cae01ff330dfbb1099cd6ef0f85' },
  { email:'owner@home-myanmar.jp', name:'Aye Theingi', role:'owner' as Role, credentialHash:'736b3fa591aad71d0b0837341bcd445ec4a7d0f8b830ffe32dc8a36e3408c8a8' },
];

const hashCredential = async (email: string, password: string) => {
  const bytes = new TextEncoder().encode(`${email.trim().toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const initialOrders = [
  { id: 'HM-362086', time: '13:42', type: 'Pickup', customer: 'ゲスト', items: 'モヒンガー ×1、ミルクティー ×1', total: 1750, status: '受付' as OrderStatus },
  { id: 'HM-362041', time: '13:31', type: 'Delivery', customer: 'Aye Thandar', items: 'チキンダンバウ ×2', total: 2500, status: '調理中' as OrderStatus },
  { id: 'HM-361998', time: '13:18', type: 'Pickup', customer: 'ゲスト', items: 'シャンヌードル ×1', total: 900, status: '受取待ち' as OrderStatus },
  { id: 'HM-361902', time: '12:54', type: 'Delivery', customer: 'M.Sato', items: 'オンノカウスエ ×1、レモンジュース ×1', total: 1650, status: '完了' as OrderStatus },
];

const initialInventory = [
  { id: 1, name: '米麺', mm: 'ဆန်ခေါက်ဆွဲ', category: '乾物', stock: 8, par: 10, unit: 'kg', supplier: 'Okinawa Asia Foods', cost: 520 },
  { id: 2, name: '鶏もも肉', mm: 'ကြက်သား', category: '肉', stock: 12, par: 8, unit: 'kg', supplier: '那覇ミート', cost: 780 },
  { id: 3, name: 'ココナッツミルク', mm: 'အုန်းနို့', category: '缶詰', stock: 18, par: 12, unit: '缶', supplier: 'Okinawa Asia Foods', cost: 260 },
  { id: 4, name: '発酵茶葉', mm: 'လက်ဖက်', category: '調味料', stock: 3, par: 8, unit: '袋', supplier: 'Myanmar Select', cost: 640 },
  { id: 5, name: 'ひよこ豆粉', mm: 'ကုလားပဲမှုန့်', category: '乾物', stock: 5, par: 6, unit: 'kg', supplier: 'Myanmar Select', cost: 480 },
  { id: 6, name: '卵', mm: 'ကြက်ဥ', category: '生鮮', stock: 42, par: 30, unit: '個', supplier: '那覇たまご', cost: 28 },
  { id: 7, name: '青マンゴー', mm: 'သရက်သီးစိမ်း', category: '野菜', stock: 4, par: 10, unit: '個', supplier: '市場本通り青果', cost: 210 },
  { id: 8, name: 'パクチー', mm: 'နံနံပင်', category: '野菜', stock: 6, par: 5, unit: '束', supplier: '市場本通り青果', cost: 180 },
];

const recipes = [
  { name: 'モヒンガー', yield: '10人前', cost: 310, ingredients: ['米麺 1.2kg', '魚 1.5kg', '玉ねぎ 800g', 'レモングラス 5本', 'ひよこ豆粉 300g'] },
  { name: 'オンノカウスエ', yield: '10人前', cost: 385, ingredients: ['卵麺 1.4kg', '鶏もも肉 1.8kg', 'ココナッツミルク 6缶', '玉ねぎ 700g', '揚げ麺 300g'] },
  { name: 'ラペットゥ', yield: '10人前', cost: 260, ingredients: ['発酵茶葉 500g', 'キャベツ 2玉', '揚げ豆 600g', '落花生 400g', 'トマト 10個'] },
];

const staffMenu = [
  { id: 1, name: 'モヒンガー', price: 850 }, { id: 2, name: 'シャンヌードル', price: 900 },
  { id: 3, name: 'チキンダンバウ', price: 1100 }, { id: 4, name: 'オンノカウスエ', price: 950 },
  { id: 5, name: 'ラペットゥ', price: 700 }, { id: 6, name: 'ミャンマー風ミルクティー', price: 400 },
];

const yen = (value: number) => `¥${value.toLocaleString('ja-JP')}`;

export default function StaffPage() {
  const [role, setRole] = useState<Role>('staff');
  const [session, setSession] = useState<StaffSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState(initialOrders);
  const [inventory, setInventory] = useState(initialInventory);
  const [staffCart, setStaffCart] = useState<Record<number, number>>({});
  const [stockOnly, setStockOnly] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const savedSession = sessionStorage.getItem('home-myanmar-staff-session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as StaffSession;
        if (staffAccounts.some((account) => account.email === parsed.email && account.role === parsed.role)) {
          setSession(parsed);
          setRole(parsed.role);
        }
      } catch { /* invalid session is ignored */ }
    }
    setAuthReady(true);
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem('home-myanmar-inventory');
    if (saved) try { setInventory(JSON.parse(saved)); } catch { /* keep defaults */ }
  }, []);
  useEffect(() => { localStorage.setItem('home-myanmar-inventory', JSON.stringify(inventory)); }, [inventory]);

  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const allowedTabs = useMemo<Tab[]>(() => role === 'staff' ? ['orders','staffshop'] : role === 'manager' ? ['orders','staffshop','inventory','recipes','purchases'] : ['orders','staffshop','inventory','recipes','purchases','sales','team'], [role]);
  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    const normalizedEmail = loginEmail.trim().toLowerCase();
    const credentialHash = await hashCredential(normalizedEmail, loginPassword);
    const account = staffAccounts.find((item) => item.email === normalizedEmail && item.credentialHash === credentialHash);
    if (!account) { setLoginError('メールアドレスまたはパスワードが正しくありません。'); return; }
    const nextSession = { email:account.email, name:account.name, role:account.role };
    sessionStorage.setItem('home-myanmar-staff-session', JSON.stringify(nextSession));
    setSession(nextSession); setRole(account.role); setTab('orders'); setLoginPassword('');
  };
  const logout = () => {
    sessionStorage.removeItem('home-myanmar-staff-session');
    setSession(null); setRole('staff'); setTab('orders'); setLoginPassword('');
  };
  const nextStatus = (status: OrderStatus): OrderStatus => status === '受付' ? '調理中' : status === '調理中' ? '受取待ち' : status === '受取待ち' ? '完了' : '完了';
  const staffSubtotal = staffMenu.reduce((sum, item) => sum + item.price * (staffCart[item.id] || 0), 0);
  const staffDiscount = Math.round(staffSubtotal * .3);
  const visibleInventory = stockOnly ? inventory.filter((item) => item.stock < item.par) : inventory;
  const adjustStock = (id: number, amount: number) => setInventory((list) => list.map((item) => item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item));

  const nav: { id: Tab; icon: string; label: string; min: Role }[] = [
    { id:'orders',icon:'▤',label:'注文管理',min:'staff' }, { id:'staffshop',icon:'％',label:'スタッフ購入 30%OFF',min:'staff' },
    { id:'inventory',icon:'▦',label:'材料・在庫',min:'manager' }, { id:'recipes',icon:'≡',label:'レシピ・原価',min:'manager' },
    { id:'purchases',icon:'◇',label:'仕入れ',min:'manager' }, { id:'sales',icon:'↗',label:'売上分析',min:'owner' },
    { id:'team',icon:'◎',label:'スタッフ・権限',min:'owner' },
  ];

  if (!authReady) return <main className='staff-login-shell'><div className='staff-login-card'><p>Loading…</p></div></main>;
  if (!session) return <main className='staff-login-shell'><form className='staff-login-card' onSubmit={login}>
    <a className='staff-login-brand' href={customerSitePath}><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>MYANMAR RESTAURANT</small></div></a>
    <p className='login-eyebrow'>STORE CONTROL</p><h1>店舗スタッフログイン</h1><p className='login-sub'>ဆိုင်ဝန်ထမ်း အကောင့်ဖြင့် ဝင်ရောက်ပါ<br/>店舗から発行された Staff・Manager・Owner アカウントをご利用ください。</p>
    <label><span>メールアドレス / Gmail</span><input type='email' autoComplete='username' value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder='staff01@home-myanmar.jp' required/></label>
    <label><span>パスワード</span><input type='password' autoComplete='current-password' value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required/></label>
    {loginError && <p className='login-error'>{loginError}</p>}
    <button type='submit'>ログイン / ဝင်ရောက်ရန်</button><a className='customer-return' href={customerSitePath}>← お客様サイトへ戻る</a>
  </form></main>;

  return <main className='staff-app'>
    <aside className='staff-sidebar'>
      <a className='staff-brand' href={customerSitePath}><span>H</span><div><strong>အိမ်လွမ်းပြေ</strong><small>STORE CONTROL</small></div></a>
      <nav>{nav.filter((item) => allowedTabs.includes(item.id)).map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <div className='sidebar-bottom'><a href={customerSitePath}>← お客様サイトへ戻る</a><small>HOME MYANMAR RESTAURANT<br/>那覇店</small></div>
    </aside>
    <section className='staff-main'>
      <header className='staff-top'><div><p>STORE MANAGEMENT</p><h1>{nav.find((item) => item.id === tab)?.label}</h1></div><div className='role-switch'><div className='signed-account'><strong>{session.name}</strong><small>{session.email}</small></div><b className={'role-badge ' + role}>{roles.find((item) => item.id === role)?.label}</b><button className='staff-logout' onClick={logout}>ログアウト</button></div></header>

      {tab === 'orders' && <div className='staff-content'><div className='metric-grid'><article><small>新規注文</small><strong>3</strong><span>対応が必要</span></article><article><small>調理中</small><strong>1</strong><span>平均 18分</span></article><article><small>本日の注文</small><strong>47</strong><span>+12% 昨日比</span></article><article><small>本日売上</small><strong>¥58,450</strong><span>目標の78%</span></article></div><div className='panel'><div className='panel-head'><div><h2>ライブ注文</h2><p>受付から受け渡しまで一つの画面で管理</p></div><button onClick={() => flash('最新の注文に更新しました')}>↻ 更新</button></div><div className='order-table'>{orders.map((order) => <article key={order.id}><div><b>#{order.id}</b><small>{order.time} · {order.type}</small></div><div><b>{order.customer}</b><small>{order.items}</small></div><strong>{yen(order.total)}</strong><span className={'status status-' + order.status}>{order.status}</span>{order.status !== '完了' ? <button className='advance' onClick={() => setOrders((list) => list.map((item) => item.id === order.id ? { ...item, status: nextStatus(item.status) } : item))}>{nextStatus(order.status)}へ →</button> : <button className='done' disabled>完了済み</button>}</article>)}</div></div></div>}

      {tab === 'staffshop' && <div className='staff-content staff-shop'><div className='discount-hero'><div><p>STAFF BENEFIT</p><h2>スタッフはいつでも30%OFF</h2><span>勤務日の本人購入に適用・転売不可</span></div><strong>30<span>%</span><small>OFF</small></strong></div><div className='shop-grid'><div className='panel'><div className='panel-head'><div><h2>スタッフメニュー</h2><p>数量を選んで従業員価格で購入できます</p></div></div><div className='staff-menu'>{staffMenu.map((item) => <article key={item.id}><div><b>{item.name}</b><small><s>{yen(item.price)}</s> <strong>{yen(Math.round(item.price * .7))}</strong></small></div><div><button onClick={() => setStaffCart((cart) => ({...cart,[item.id]:Math.max(0,(cart[item.id] || 0)-1)}))}>−</button><span>{staffCart[item.id] || 0}</span><button onClick={() => setStaffCart((cart) => ({...cart,[item.id]:(cart[item.id] || 0)+1}))}>＋</button></div></article>)}</div></div><aside className='staff-checkout'><h3>従業員購入</h3><p><span>通常価格</span><b>{yen(staffSubtotal)}</b></p><p className='discount'><span>スタッフ割引（30%）</span><b>−{yen(staffDiscount)}</b></p><div><span>お支払い</span><strong>{yen(staffSubtotal - staffDiscount)}</strong></div><label>支払方法<select><option>給与控除</option><option>現金</option><option>PayPay</option></select></label><button disabled={!staffSubtotal} onClick={() => { setStaffCart({}); flash('スタッフ購入を記録しました'); }}>30%OFFで購入を確定</button><small>購入者：現在のStaffアカウント</small></aside></div></div>}

      {tab === 'inventory' && <div className='staff-content'><div className='metric-grid'><article><small>材料品目</small><strong>{inventory.length}</strong><span>登録済み</span></article><article className='warn'><small>発注が必要</small><strong>{inventory.filter((item) => item.stock < item.par).length}</strong><span>基準在庫を下回る</span></article><article><small>在庫評価額</small><strong>{yen(inventory.reduce((sum,item) => sum + item.stock * item.cost,0))}</strong><span>現在庫 × 原価</span></article><article><small>最終棚卸</small><strong>8/19</strong><span>本日 10:30</span></article></div><div className='panel'><div className='panel-head'><div><h2>材料・在庫一覧</h2><p>残量を更新すると次の発注候補に反映されます</p></div><label className='stock-filter'><input type='checkbox' checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)}/>不足のみ</label></div><div className='inventory-table'><div className='table-head'><span>材料</span><span>分類</span><span>現在庫 / 基準</span><span>仕入先</span><span>原価</span><span>在庫更新</span></div>{visibleInventory.map((item) => <div className={item.stock < item.par ? 'low' : ''} key={item.id}><span><b>{item.name}</b><small>{item.mm}</small></span><span>{item.category}</span><span><b>{item.stock} {item.unit}</b><small>基準 {item.par} {item.unit}</small></span><span>{item.supplier}</span><span>{yen(item.cost)}</span><span className='stock-step'><button onClick={() => adjustStock(item.id,-1)}>−</button><b>{item.stock}</b><button onClick={() => adjustStock(item.id,1)}>＋</button></span></div>)}</div></div></div>}

      {tab === 'recipes' && <div className='staff-content'><div className='panel'><div className='panel-head'><div><h2>レシピ・原価表</h2><p>材料使用量、標準原価、販売価格を確認</p></div><button onClick={() => flash('新しいレシピ登録画面は準備中です')}>＋ レシピ追加</button></div><div className='recipe-grid'>{recipes.map((recipe) => <article key={recipe.name}><div><span>STANDARD RECIPE</span><h3>{recipe.name}</h3><p>{recipe.yield}</p></div><ul>{recipe.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul><footer><span>1人前原価 <b>{yen(recipe.cost)}</b></span><span>原価率 <b>{Math.round(recipe.cost / 9)}%</b></span></footer></article>)}</div></div></div>}

      {tab === 'purchases' && <div className='staff-content'><div className='panel'><div className='panel-head'><div><h2>仕入れ候補</h2><p>基準在庫を下回った材料から自動作成</p></div><button onClick={() => flash('発注書を作成しました')}>発注書を作成</button></div><div className='purchase-list'>{inventory.filter((item) => item.stock < item.par).map((item) => <article key={item.id}><span className='supplier-dot'>◇</span><div><b>{item.name}</b><small>{item.supplier}</small></div><p>現在 {item.stock}{item.unit}<small>基準 {item.par}{item.unit}</small></p><label>発注数<input type='number' defaultValue={Math.max(item.par * 2 - item.stock,1)}/>{item.unit}</label><strong>{yen(Math.max(item.par * 2 - item.stock,1) * item.cost)}</strong><button onClick={() => flash(`${item.name}を発注リストに追加しました`)}>追加</button></article>)}</div></div></div>}

      {tab === 'sales' && <div className='staff-content'><div className='metric-grid'><article><small>本日売上</small><strong>¥58,450</strong><span>+12% 昨日比</span></article><article><small>今月売上</small><strong>¥1,284,600</strong><span>目標 82%</span></article><article><small>平均客単価</small><strong>¥1,244</strong><span>+¥86 先月比</span></article><article><small>推定粗利率</small><strong>61.8%</strong><span>原価・割引反映</span></article></div><div className='sales-grid'><div className='panel'><h2>週間売上</h2><div className='bars'>{[68,82,61,90,76,96,72].map((height,index) => <div key={index}><span style={{height:height+'%'}}></span><small>{['月','火','水','木','金','土','日'][index]}</small></div>)}</div></div><div className='panel ranking'><h2>人気商品 TOP 5</h2>{['モヒンガー','チキンダンバウ','オンノカウスエ','シャンヌードル','ラペットゥ'].map((item,index) => <p key={item}><span>{index+1}</span><b>{item}</b><strong>{[42,35,31,27,24][index]}点</strong></p>)}</div></div></div>}

      {tab === 'team' && <div className='staff-content'><div className='panel'><div className='panel-head'><div><h2>スタッフ・権限</h2><p>役割ごとに閲覧・操作できる機能を制限</p></div><button onClick={() => flash('スタッフ招待画面は準備中です')}>＋ スタッフ招待</button></div><div className='team-list'>{[{name:'Aye Theingi',email:'owner@home-myanmar.jp',role:'Owner',last:'現在オンライン'},{name:'Aye Thandar',email:'manager@home-myanmar.jp',role:'Manager',last:'本日 12:20'},{name:'Moe Moe',email:'staff01@home-myanmar.jp',role:'Staff',last:'本日 10:02'}].map((member) => <article key={member.email}><span>{member.name.split(' ').map((part) => part[0]).join('')}</span><div><b>{member.name}</b><small>{member.email}</small></div><strong>{member.role}</strong><small>{member.last}</small><button>⋯</button></article>)}</div><div className='permission-matrix'><h3>権限一覧</h3><div><span>機能</span><b>Staff</b><b>Manager</b><b>Owner</b></div>{[['注文管理','✓','✓','✓'],['スタッフ30%OFF購入','✓','✓','✓'],['材料・在庫・レシピ','—','✓','✓'],['仕入れ管理','—','✓','✓'],['売上・原価分析','—','—','✓'],['スタッフ権限変更','—','—','✓']].map((row) => <div key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><b>{row[2]}</b><b>{row[3]}</b></div>)}</div></div></div>}
    </section>
    {toast && <div className='staff-toast'>✓ {toast}</div>}
  </main>;
}
