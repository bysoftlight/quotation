// softlight · โปรแกรมใบเสนอราคา (HR Paper Mill)
// ข้อมูลทั้งหมดเก็บในเบราว์เซอร์เครื่องนี้ (localStorage) — ไม่มีการส่งข้อมูลออกไปที่ใด

// ===================== ราคาแพ็กเกจ (แก้ที่นี่ถ้าเปลี่ยนราคามาตรฐาน) =====================
const PRICES = {
  regular:   { basic: 39000, standard: 89000, pro: 149000, sub: { starter: [1900, 5000], business: [3500, 9900], enterprise: [5900, 14900] }, ma: 24000, hour: 900,
               addons: [15000, 12000, 12000, 9000, 9000, 7000] },
  exclusive: { basic: 32000, standard: 72000, pro: 119000, sub: { starter: [1500, 2500], business: [2900, 4900], enterprise: [4900, 7900] }, ma: 19000, hour: 800,
               addons: [12000, 9500, 9500, 7000, 7000, 5500] }
};
const ADDON_NAMES = [['แจ้งเตือนผู้ที่ยังไม่ส่งรายงานทาง LINE', '2 สัปดาห์'], ['ส่งรายงานได้แม้สัญญาณหลุด + ติดตั้งเป็นแอป', '2 สัปดาห์'],
  ['โหมดตรวจรูปและอนุมัติรายงาน · ตรวจรูปซ้ำ', '2 สัปดาห์'], ['แยกเก็บข้อมูลรายเดือน', '1–2 สัปดาห์'],
  ['กล้องพร้อมกรอบนำถ่าย + ประทับวันเวลา/พิกัด', '1–2 สัปดาห์'], ['โหมดอ่านง่ายสำหรับผู้พิการ', '1 สัปดาห์']];
const FEATURES = {
  basic: ['แอปส่งรายงาน: GPS · ประเภทการขาย · ถ่ายรูปหลักฐาน · ประวัติ · PDF รายเดือน', 'Dashboard ภาพรวมวันนี้ + รายชื่อยังไม่ส่ง · รายงานพร้อมตัวกรอง · ส่งออก Excel', 'จัดการผู้ใช้สิทธิ์ · เข้าสู่ระบบเจ้าหน้าที่ด้วย Google', 'ผู้ใช้สิทธิ์ไม่เกิน 50 คน · เจ้าหน้าที่ 3 บัญชี · ติดตั้ง + อบรม 1 ชม.'],
  standard: ['ทุกอย่างใน Basic + แผนที่ · ตรวจตำแหน่งผิดปกติ · อัปเดตสด', 'แก้ไข/เพิ่ม/ลบรายงาน (มีเหตุผล กู้คืนได้) · รูปโปรไฟล์ · เปลี่ยนรหัส/ลบผู้ใช้สิทธิ์', 'Google + LINE Login · อนุมัติบัญชี · สิทธิ์รายบทบาท · Log ทุกการกระทำ', 'ส่งออก PDF · Excel · Google Sheets · สรุปรายวันทางอีเมล', 'ผู้ใช้สิทธิ์ไม่เกิน 200 คน · ย้ายข้อมูลเดิม · อบรม 3 ชม.'],
  pro: ['ทุกอย่างใน Standard', 'แจ้งเตือนผู้ที่ยังไม่ส่งทาง LINE · โหมดตรวจรูป/อนุมัติ · ตรวจรูปซ้ำ', 'ส่งได้แม้สัญญาณหลุด · ติดตั้งเป็นแอป · โหมดอ่านง่าย · กล้องพร้อมกรอบนำถ่าย', 'แยกข้อมูลรายเดือน · ระบบทดสอบแยก · โดเมนบริษัท', 'ผู้ใช้สิทธิ์ไม่จำกัด · อบรม 2 ครั้ง · ดูแลระบบ (MA) ปีแรก']
};
const PLAN = { basic: 'Basic', standard: 'Standard', pro: 'Pro', starter: 'Starter', business: 'Business', enterprise: 'Enterprise' };
const SUB_LEVEL = { starter: 'basic', business: 'standard', enterprise: 'pro' };
const WARRANTY = { basic: '30 วัน', standard: '90 วัน', pro: '180 วัน' };
const TIMELINE = { basic: '3–4 สัปดาห์', standard: '6–8 สัปดาห์', pro: '10–12 สัปดาห์' };

const DEFAULT_SELLER = { name: 'softlight', owner: 'Oannob Aphairun', addr: '', taxId: '', phone: '', email: '', vatReg: false };
const STORE_KEY = 'softlight-quotes-v1';

// ===================== ข้อมูล =====================
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = n => Number(n || 0).toLocaleString('th-TH');
const todayIso = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
const thYear = iso => Number(iso.slice(0, 4)) + 543;
const thDate = iso => iso ? new Date(iso + 'T12:00:00+07:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }) : '';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function loadStore() {
  try { const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (s && s.docs) return s; } catch (e) {}
  return { docs: {}, current: null, seller: null, seq: {} };
}
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); setSaveState('ok', 'บันทึกแล้ว ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })); return true; }
  catch (e) { setSaveState('error', 'บันทึกในเครื่องไม่ได้'); toast('บันทึกในเครื่องนี้ไม่ได้ — ใช้ "ดาวน์โหลดข้อมูล" เพื่อเก็บไว้'); return false; }
}
const S = loadStore();

function nextNo(dateIso) {
  const y = thYear(dateIso || todayIso());
  S.seq[y] = (S.seq[y] || 0) + 1;
  return `QT-${y}-${String(S.seq[y]).padStart(3, '0')}`;
}

function blankDoc() {
  const date = todayIso();
  return {
    id: uid(), no: nextNo(date), date, validDays: 30, badge: '', updatedAt: Date.now(),
    title: 'ระบบ HR Paper Mill',
    intro: 'ระบบส่งรายงานการขายประจำวันสำหรับโครงการใช้สิทธิ์สัมปทานผู้พิการตามมาตรา 35 พร้อม Dashboard สำหรับเจ้าหน้าที่ HR ใช้ได้ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ ทำงานบน Google Workspace จึงไม่มีค่าเซิร์ฟเวอร์รายเดือน',
    seller: Object.assign({}, DEFAULT_SELLER, S.seller || {}),
    customer: { name: '', addr: '', taxId: '', attn: '', contact: '' },
    items: [], discount: 0, discountType: 'amount', discountLabel: 'ส่วนลดพิเศษ', withholding: true,
    showServices: false, services: '', showAddons: false, addons: '', terms: ''
  };
}

// ===================== แม่แบบแพ็กเกจ =====================
const TEMPLATES = [
  { key: 'basic', label: 'Basic', note: 'ซื้อขาด' }, { key: 'standard', label: 'Standard', note: 'ซื้อขาด' }, { key: 'pro', label: 'Pro', note: 'ซื้อขาด' },
  { key: 'starter-y', label: 'Starter', note: 'รายปี' }, { key: 'business-y', label: 'Business', note: 'รายปี' }, { key: 'enterprise-y', label: 'Enterprise', note: 'รายปี' },
  { key: 'starter-m', label: 'Starter', note: 'รายเดือน' }, { key: 'business-m', label: 'Business', note: 'รายเดือน' }, { key: 'enterprise-m', label: 'Enterprise', note: 'รายเดือน' }
];
function applyTemplate(key, tier) {
  const reg = PRICES.regular, cur = PRICES[tier];
  const ex = tier === 'exclusive';
  const d = DOC;
  d.tpl = key + ':' + tier;
  d.badge = ex ? 'EXCLUSIVE' : '';
  d.discountType = 'amount';
  d.discountLabel = ex ? 'ส่วนลดพิเศษลูกค้า Exclusive' : 'ส่วนลดพิเศษ';
  const addonLines = ADDON_NAMES.map(([n, t], i) => `${n} | ${t} | ${money0(cur.addons[i])}`).join('\n');
  const serviceLines = `ดูแลระบบรายปี (MA): แก้ไขข้อผิดพลาด · สำรองข้อมูล · ปรับแก้เล็กน้อย 4 ชม./เดือน | ${money0(cur.ma)} / ปี\nงานแก้ไข/เพิ่มเติมนอกขอบเขต (ประเมินก่อนเริ่มงาน) | ${money0(cur.hour)} / ชั่วโมง`;
  const vatNote = d.seller.vatReg ? 'ราคาเป็นสกุลเงินบาท ยอดสุทธิรวมภาษีมูลค่าเพิ่ม 7% แล้ว' : 'ราคาเป็นสกุลเงินบาท ผู้เสนอราคาไม่ได้จดทะเบียนภาษีมูลค่าเพิ่ม (ไม่มี VAT)';
  if (['basic', 'standard', 'pro'].includes(key)) {
    d.title = `ระบบ HR Paper Mill — แพ็กเกจ ${PLAN[key]} (ซื้อขาด)`;
    d.items = [{ t: `ระบบ HR Paper Mill แพ็กเกจ ${PLAN[key]}`, d: FEATURES[key].join('\n'), qty: 1, unit: 'ชุด', price: reg[key] }];
    d.discount = reg[key] - cur[key];
    d.showServices = key !== 'pro'; d.services = serviceLines;
    d.showAddons = key !== 'pro'; d.addons = addonLines;
    d.terms = [`ระยะเวลาดำเนินงานประมาณ ${TIMELINE[key]} นับจากวันที่ได้รับใบสั่งซื้อและเงินมัดจำ`,
      'ชำระ 3 งวด: 50% เมื่อลงนาม · 40% เมื่อส่งมอบระบบให้ทดสอบ · 10% เมื่อตรวจรับและอบรมเสร็จ',
      `รับประกันผลงาน ${WARRANTY[key]} หลังตรวจรับ แก้ไขข้อผิดพลาดของระบบโดยไม่มีค่าใช้จ่าย`,
      'ลูกค้าเป็นเจ้าของข้อมูลทั้งหมด ข้อมูลจัดเก็บในบัญชี Google ของลูกค้า และได้รับซอร์สโค้ดเมื่อชำระครบ',
      'การเปลี่ยนแปลงขอบเขตงานจะประเมินราคาและระยะเวลาเพิ่มก่อนดำเนินการ',
      'ลูกค้าเป็นผู้ควบคุมข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล ระบบเข้าถึงข้อมูลตามสิทธิ์และบันทึก Log ทุกการกระทำ',
      vatNote + (ex ? ' · ราคาพิเศษ Exclusive สำหรับลูกค้ารายนี้เท่านั้น' : ''),
      'ใบเสนอราคานี้มีผลถึงวันที่ระบุด้านบน'].join('\n');
  } else {
    const [plan, mode] = key.split('-');
    const [mReg, sReg] = reg.sub[plan], [mCur, sCur] = cur.sub[plan];
    const level = SUB_LEVEL[plan];
    d.title = `ระบบ HR Paper Mill — Subscription ${PLAN[plan]} (${mode === 'y' ? 'รายปี' : 'รายเดือน'})`;
    const feats = FEATURES[level].join('\n') + '\nรวม: ดูแลระบบ · อัปเดตฟังก์ชัน · สำรองข้อมูลรายสัปดาห์ · ช่วยเหลือในวันทำการ';
    d.items = [{ t: 'ค่าติดตั้งและตั้งค่าระบบ (ชำระครั้งเดียว)', d: 'ติดตั้งระบบ · ตั้งค่าบัญชี · นำเข้ารายชื่อผู้ใช้สิทธิ์ · อบรมการใช้งาน', qty: 1, unit: 'ครั้ง', price: sReg }];
    if (mode === 'y') d.items.push({ t: `ค่าบริการ ${PLAN[plan]} รายปี (จ่าย 10 เดือน ใช้ 12 เดือน)`, d: feats, qty: 1, unit: 'ปี', price: mReg * 10 });
    else d.items.push({ t: `ค่าบริการ ${PLAN[plan]} รายเดือน`, d: feats, qty: 12, unit: 'เดือน', price: mReg });
    const regTotal = sReg + (mode === 'y' ? mReg * 10 : mReg * 12);
    const curTotal = sCur + (mode === 'y' ? mCur * 10 : mCur * 12);
    d.discount = regTotal - curTotal;
    d.showServices = false; d.services = serviceLines;
    d.showAddons = false; d.addons = addonLines;
    d.terms = [mode === 'y' ? 'ชำระค่าติดตั้งและค่าบริการรายปีล่วงหน้าเมื่อลงนาม' : 'ชำระค่าติดตั้งเมื่อลงนาม · ค่าบริการชำระล่วงหน้าทุกเดือน',
      'สัญญาขั้นต่ำ 12 เดือน ต่ออายุอัตโนมัติ แจ้งยกเลิกล่วงหน้า 30 วัน',
      'ลูกค้าเป็นเจ้าของข้อมูล ส่งออกข้อมูลทั้งหมดได้ทุกเมื่อ (ซอฟต์แวร์เป็นสิทธิ์การใช้งาน)',
      'อัปเกรดระดับได้ทันที คิดส่วนต่างตามวันที่เหลือ',
      `ผู้ใช้สิทธิ์เกินกำหนด: +${ex ? 250 : 300} บาท/เดือน ต่อทุก 25 คน`,
      ex ? 'ทดลองใช้ฟรี 30 วันก่อนเริ่มสัญญา · ราคาคงที่ตลอดสัญญาแรก' : 'ทดลองใช้ฟรี 14 วันก่อนเริ่มสัญญา',
      vatNote + (ex ? ' · ราคาพิเศษ Exclusive สำหรับลูกค้ารายนี้เท่านั้น' : ''),
      'ใบเสนอราคานี้มีผลถึงวันที่ระบุด้านบน'].join('\n');
  }
  if (!d.discount) d.discountLabel = 'ส่วนลดพิเศษ';
}

// ===================== คำนวณ =====================
function bahtText(n) {
  const digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'], units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  const read = num => {
    if (num === 0) return '';
    if (num >= 1e6) return read(Math.floor(num / 1e6)) + 'ล้าน' + read(num % 1e6);
    const s = String(num); let out = '';
    for (let i = 0; i < s.length; i++) {
      const d = +s[i], pos = s.length - i - 1;
      if (!d) continue;
      if (pos === 1 && d === 1) out += 'สิบ';
      else if (pos === 1 && d === 2) out += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && s.length > 1) out += 'เอ็ด';
      else out += digits[d] + units[pos];
    }
    return out;
  };
  const r = Math.round(n * 100) / 100, baht = Math.floor(r), satang = Math.round((r - baht) * 100);
  return (read(baht) || 'ศูนย์') + 'บาท' + (satang ? read(satang) + 'สตางค์' : 'ถ้วน');
}
const round2 = n => Math.round(n * 100) / 100;
function totals(d) {
  const sub = round2(d.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0));
  const disc = round2(Math.min(sub, d.discountType === 'percent' ? sub * (Number(d.discount) || 0) / 100 : (Number(d.discount) || 0)));
  const after = round2(sub - disc);
  const vat = d.seller.vatReg ? round2(after * 0.07) : 0;
  const grand = round2(after + vat);
  const wht = d.withholding ? round2(after * 0.03) : 0;
  return { sub, disc, after, vat, grand, wht, pay: round2(grand - wht) };
}


// ===================== UI ทั่วไป: สถานะบันทึก · toast · กล่องยืนยัน · ธีม · ตัวเลขนับขึ้น =====================
function setSaveState(state, text) {
  const el = $('savedState');
  el.className = 'save-state' + (state === 'saving' ? ' is-saving' : state === 'error' ? ' is-error' : '');
  el.querySelector('span').textContent = text;
}
let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('is-on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
}
// แทน confirm(): คืนค่า Promise<boolean>
function ask(title, text, yes = 'ตกลง', danger = false) {
  const dlg = $('askDialog');
  $('askTitle').textContent = title; $('askText').textContent = text || '';
  $('askYes').textContent = yes;
  $('askYes').className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  return new Promise(resolve => {
    const done = v => { dlg.close(); $('askYes').onclick = $('askNo').onclick = null; dlg.oncancel = null; resolve(v); };
    $('askYes').onclick = () => done(true);
    $('askNo').onclick = () => done(false);
    dlg.oncancel = e => { e.preventDefault(); done(false); };
    dlg.showModal(); $('askNo').focus();
  });
}

const THEMES = [['system', 'ตามเครื่อง', 'i-auto'], ['light', 'สว่าง', 'i-sun'], ['dark', 'มืด', 'i-moon']];
function getTheme() { try { return localStorage.getItem('softlight-theme') || 'system'; } catch (e) { return 'system'; } }
function applyTheme(t) {
  const root = document.documentElement;
  if (t === 'system') delete root.dataset.theme; else root.dataset.theme = t;
  const th = THEMES.find(x => x[0] === t) || THEMES[0];
  $('btnTheme').setAttribute('aria-label', 'ธีม: ' + th[1] + ' (แตะเพื่อเปลี่ยน)');
  $('btnTheme').title = 'ธีม: ' + th[1];
  $('btnTheme').querySelector('use').setAttribute('href', '#' + th[2]);
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#131314' : '#FFFFFF';
}

const reducedMotion = () => document.documentElement.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
// ยอดสุทธินับจากค่าเดิมไปค่าใหม่ (เหมือน Counting Number ใน HR Paper Mill)
function countTo(el, value) {
  const from = el._v === undefined ? 0 : el._v;
  el._v = value;
  cancelAnimationFrame(el._raf);
  if (from === value || reducedMotion()) { el.textContent = money(value); return; }
  const t0 = performance.now(), dur = 700;
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = money(from + (value - from) * e);
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

// ===================== แสดงตัวอย่าง (A4) =====================
const mark = (v, ph) => v ? esc(v).replace(/\n/g, '<br>') : `<span class="empty-mark">[${ph}]</span>`;
const bullets = txt => { const l = String(txt || '').split('\n').map(s => s.trim()).filter(Boolean); return l.length ? `<ul>${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''; };
const splitRows = txt => String(txt || '').split('\n').map(s => s.trim()).filter(Boolean).map(l => l.split('|').map(x => x.trim()));
const validUntil = d => d.date ? new Date(new Date(d.date + 'T12:00:00+07:00').getTime() + (Number(d.validDays) || 0) * 864e5).toISOString().slice(0, 10) : '';

function renderPaper() {
  const d = DOC, s = d.seller, c = d.customer, t = totals(d);
  const sellerSub = [s.owner ? 'โดย ' + esc(s.owner) : '', s.taxId ? 'เลขประจำตัวผู้เสียภาษี ' + esc(s.taxId) : ''].filter(Boolean).join(' · ');
  let h = `
  <header class="p-top">
    <div class="p-brand"><img src="img/softlight-logo.png" alt=""><div><b>${mark(s.name, 'ชื่อทีม')}</b><small>${sellerSub}</small></div></div>
    <div class="p-title"><span class="en">QUOTATION</span><h1>ใบเสนอราคา</h1>${d.badge ? `<span class="ex">${esc(d.badge)}</span>` : ''}
      <dl class="p-meta"><dt>เลขที่</dt><dd class="mono">${esc(d.no)}</dd><dt>วันที่</dt><dd>${thDate(d.date)}</dd><dt>ยืนราคาถึง</dt><dd>${thDate(validUntil(d))}</dd></dl></div>
  </header>
  <section class="p-parties">
    <div class="p-box"><h3>เสนอต่อ (ลูกค้า)</h3>${mark(c.name, 'ชื่อบริษัทลูกค้า')}<br>${mark(c.addr, 'ที่อยู่')}${c.taxId ? '<br>เลขประจำตัวผู้เสียภาษี ' + esc(c.taxId) : ''}<br>เรียน ${mark(c.attn, 'ผู้ติดต่อ')}${c.contact ? ' · ' + esc(c.contact) : ''}</div>
    <div class="p-box"><h3>ผู้เสนอราคา</h3>${esc(s.name)}${s.owner ? ' · ' + esc(s.owner) : ''}<br>${mark(s.addr, 'ที่อยู่')}<br>${mark(s.phone, 'เบอร์โทร')} · ${mark(s.email, 'อีเมล')}</div>
  </section>
  <h2>${esc(d.title)}</h2>
  ${d.intro ? `<p class="lead">${esc(d.intro)}</p>` : ''}
  <h2>รายการ</h2>
  <table><thead><tr><th>#</th><th>รายการ</th><th class="num">จำนวน</th><th class="num">ราคา/หน่วย</th><th class="num">จำนวนเงิน (บาท)</th></tr></thead><tbody>
  ${d.items.map((it, i) => `<tr><td class="no">${i + 1}</td><td><span class="t">${esc(it.t)}</span>${bullets(it.d)}</td><td class="num">${esc(it.qty)} ${esc(it.unit || '')}</td><td class="num">${money(it.price)}</td><td class="num">${money((Number(it.qty) || 0) * (Number(it.price) || 0))}</td></tr>`).join('') || '<tr><td colspan="5" class="empty-row">ยังไม่มีรายการ — เลือกแพ็กเกจหรือกด "เพิ่มรายการ"</td></tr>'}
  </tbody></table>
  <div class="p-keep">
  <table class="p-totals"><tbody>
    <tr><td>รวมเป็นเงิน</td><td class="num">${money(t.sub)}</td></tr>
    ${t.disc ? `<tr><td>${esc(d.discountLabel || 'ส่วนลด')}${d.discountType === 'percent' ? ` (${esc(d.discount)}%)` : ''}</td><td class="num">-${money(t.disc)}</td></tr><tr><td>ยอดหลังหักส่วนลด</td><td class="num">${money(t.after)}</td></tr>` : ''}
    ${s.vatReg ? `<tr><td>ภาษีมูลค่าเพิ่ม 7%</td><td class="num">${money(t.vat)}</td></tr>` : ''}
    <tr class="grand"><td>ยอดสุทธิ</td><td class="num">${money(t.grand)}</td></tr>
    ${d.withholding && t.grand > 0 ? `<tr class="info"><td>หักภาษี ณ ที่จ่าย 3% (ถ้าลูกค้าเป็นนิติบุคคล)</td><td class="num">-${money(t.wht)}</td></tr><tr class="info"><td>ยอดโอนชำระหลังหัก ณ ที่จ่าย</td><td class="num">${money(t.pay)}</td></tr>` : ''}
  </tbody></table>
  <div class="p-baht">(${bahtText(t.grand)})</div>
  </div>`;
  const services = splitRows(d.services), addons = splitRows(d.addons);
  if (d.showServices && services.length) h += `<h2>บริการดูแลระบบ (ไม่บังคับ)</h2><table><thead><tr><th>#</th><th>รายการ</th><th class="num">ราคา (บาท)</th></tr></thead><tbody>${services.map((r, i) => `<tr><td class="no">${i + 1}</td><td>${esc(r[0])}</td><td class="num">${esc(r[1] || '')}</td></tr>`).join('')}</tbody></table>`;
  if (d.showAddons && addons.length) h += `<h2>ฟังก์ชันเสริม (เลือกเพิ่มได้)</h2><table><thead><tr><th>#</th><th>รายการ</th><th class="num">ระยะเวลา</th><th class="num">ราคา (บาท)</th></tr></thead><tbody>${addons.map((r, i) => `<tr><td class="no">${i + 1}</td><td>${esc(r[0])}</td><td class="num">${esc(r[1] || '')}</td><td class="num">${esc(r[2] || '')}</td></tr>`).join('')}</tbody></table>`;
  const terms = String(d.terms || '').split('\n').map(x => x.trim()).filter(Boolean);
  h += `<section class="p-keep">${terms.length ? `<h2>เงื่อนไข</h2><ol>${terms.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
    <div class="p-sign"><div><div class="line"></div>ผู้เสนอราคา${s.owner ? '<br>(' + esc(s.owner) + ')' : ''}<br><span class="date">วันที่ ......../......../........</span></div>
    <div><div class="line"></div>ผู้อนุมัติสั่งซื้อ (ลูกค้า)<br>(......................................................)<br><span class="date">วันที่ ......../......../........</span></div></div></section>`;
  $('paper').innerHTML = h;
  fitPaper();
}

// จอแคบ: ย่อกระดาษ A4 ให้พอดีความกว้าง (ตอนพิมพ์ใช้ขนาดจริง)
function fitPaper() {
  const wrap = document.querySelector('.preview'), paper = $('paper');
  if (!wrap.offsetWidth) return;
  paper.style.zoom = '';
  const cs = getComputedStyle(wrap);
  const avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), full = paper.offsetWidth;
  const z = avail > 0 && full > avail ? Math.max(0.3, avail / full) : 1;
  if (z < 1) paper.style.zoom = String(z);
  $('zoomInfo').textContent = z < 1 ? `ย่อเหลือ ${Math.round(z * 100)}% ให้พอดีจอ · พิมพ์ขนาดจริง` : 'ขนาดจริง';
}
let fitTimer = 0;
window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitPaper, 80); });
window.addEventListener('beforeprint', () => { $('paper').style.zoom = ''; });
window.addEventListener('afterprint', fitPaper);

// ===================== สรุปด้านบน + สรุปบนหัวการ์ด =====================
function renderSummary() {
  const d = DOC, c = d.customer, s = d.seller, t = totals(d);
  $('docLabel').textContent = 'ใบเสนอราคา · ' + d.no;
  $('heroNo').textContent = d.no;
  $('heroBadge').hidden = !d.badge; $('heroBadge').textContent = d.badge || '';
  $('heroCustomer').textContent = c.name || 'ยังไม่ระบุลูกค้า';
  $('heroCustomer').classList.toggle('is-empty', !c.name);
  $('heroPlan').textContent = d.title;
  countTo($('heroTotal'), t.grand);
  const rows = [['รวมเป็นเงิน', t.sub]];
  if (t.disc) rows.push([d.discountLabel || 'ส่วนลด', -t.disc]);
  if (s.vatReg) rows.push(['VAT 7%', t.vat]);
  if (d.withholding && t.grand > 0) rows.push(['ยอดโอนหลังหัก ณ ที่จ่าย 3%', t.pay]);
  $('heroRows').innerHTML = rows.map(([k, v]) => `<div><span>${esc(k)}</span><span class="mono">${v < 0 ? '-' : ''}${money(Math.abs(v))}</span></div>`).join('')
    + (s.vatReg ? '' : '<div><span>ไม่มี VAT (ผู้เสนอราคาไม่ได้จดทะเบียน)</span></div>');
  document.title = `${d.no} · ${c.name || 'ใบเสนอราคา'} · softlight`;

  // หัวการ์ด: สรุปสั้นๆ + เครื่องหมายเสร็จ
  const tpl = d.tpl && TEMPLATES.find(x => x.key === d.tpl.split(':')[0]);
  setSum('cardTpl', 'sumTpl', tpl ? `${tpl.label} · ${tpl.note}${d.tpl.endsWith('exclusive') ? ' · Exclusive' : ''}` : 'กดแล้วจะเติมรายการ เงื่อนไข และส่วนลดให้', !!tpl);
  setSum('cardCustomer', 'sumCustomer', c.name ? [c.name, c.attn && 'เรียน ' + c.attn].filter(Boolean).join(' · ') : 'ยังไม่ระบุ', !!c.name);
  setSum('cardDoc', 'sumDoc', `${d.no} · ${thDate(d.date)} · ยืนราคา ${d.validDays || 0} วัน`, !!(d.no && d.date));
  setSum('cardItems', 'sumItems', d.items.length ? `${d.items.length} รายการ · ${money0(t.sub)} บาท${t.disc ? ` · ลด ${money0(t.disc)}` : ''}` : 'ยังไม่มีรายการ', d.items.length > 0);
  const terms = String(d.terms || '').split('\n').filter(x => x.trim()).length;
  setSum('cardMore', 'sumMore', [terms ? `เงื่อนไข ${terms} ข้อ` : 'ยังไม่มีเงื่อนไข', d.showServices && 'บริการดูแลระบบ', d.showAddons && 'ฟังก์ชันเสริม'].filter(Boolean).join(' · '), terms > 0);
  const sellerOk = !!(s.name && s.addr && s.phone && s.email);
  setSum('sellerCard', 'sumSeller', sellerOk ? `${s.name}${s.owner ? ' · ' + s.owner : ''} · ${s.vatReg ? 'มี VAT' : 'ไม่มี VAT'}` : 'ยังกรอกไม่ครบ (ที่อยู่ เบอร์โทร อีเมล)', sellerOk);
}
function setSum(cardId, sumId, text, done) {
  $(sumId).textContent = text;
  const card = $(cardId);
  card.classList.toggle('is-done', done);
  const n = card.querySelector('.step-num');
  if (!n.dataset.n) n.dataset.n = n.textContent;
  n.innerHTML = done ? '<svg class="ic ic-16" aria-hidden="true"><use href="#i-check"/></svg><span class="sr-only">เสร็จแล้ว</span>' : n.dataset.n;
}

function render() { renderPaper(); renderSummary(); }

// ===================== แพ็กเกจสำเร็จรูป =====================
let TIER = 'regular';
function tplPrice(key, tier) {
  const p = PRICES[tier];
  if (['basic', 'standard', 'pro'].includes(key)) return `${money0(p[key])} บาท`;
  const [plan, mode] = key.split('-');
  const [m] = p.sub[plan];
  return mode === 'y' ? `${money0(m * 10)} บาท/ปี` : `${money0(m)} บาท/เดือน`;
}
function renderTemplates() {
  const groups = [['ซื้อขาด', k => !k.includes('-'), 'once'], ['Subscription รายปี (จ่าย 10 ใช้ 12 เดือน)', k => k.endsWith('-y'), 'year'], ['Subscription รายเดือน', k => k.endsWith('-m'), 'month']];
  $('tplGrid').innerHTML = groups.map(([title, f, tone]) => `
    <div class="tpl-group"><h3>${title}</h3><div class="tpl-grid">
      ${TEMPLATES.filter(t => f(t.key)).map(t => `<button class="tpl tone-${tone}${DOC && DOC.tpl === t.key + ':' + TIER ? ' is-on' : ''}" type="button" data-tpl="${t.key}" aria-pressed="${DOC && DOC.tpl === t.key + ':' + TIER}"><b>${t.label}</b><small class="mono">${tplPrice(t.key, TIER)}</small></button>`).join('')}
    </div></div>`).join('');
}

// ===================== ฟอร์ม =====================
let DOC = null;
const getK = (o, k) => k.split('.').reduce((a, p) => a == null ? a : a[p], o);
const setK = (o, k, v) => { const ps = k.split('.'); const last = ps.pop(); ps.reduce((a, p) => a[p], o)[last] = v; };

function fillForm() {
  document.querySelectorAll('[data-k]').forEach(el => {
    const v = getK(DOC, el.dataset.k);
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v == null ? '' : v;
  });
  renderItems();
  if (DOC.tpl) {
    TIER = DOC.tpl.split(':')[1] || 'regular';
    $('priceTier').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tier === TIER)));
  }
  renderTemplates();
  const sl = DOC.seller;
  if (!sl.addr || !sl.phone || !sl.email) $('sellerCard').open = true; // ข้อมูลผู้เสนอราคายังไม่ครบ: เปิดไว้ให้เห็น
}
function itemAmount(it) { return (Number(it.qty) || 0) * (Number(it.price) || 0); }
function renderItems() {
  $('items').innerHTML = DOC.items.map((it, i) => `
    <div class="item" data-i="${i}">
      <div class="item-head"><b>รายการที่ ${i + 1}</b><span class="amt mono">${money(itemAmount(it))}</span>
        <button class="icon-btn sm" type="button" data-act="up" aria-label="เลื่อนรายการที่ ${i + 1} ขึ้น" ${i ? '' : 'disabled'}><svg class="ic ic-16"><use href="#i-up"/></svg></button>
        <button class="icon-btn sm" type="button" data-act="down" aria-label="เลื่อนรายการที่ ${i + 1} ลง" ${i < DOC.items.length - 1 ? '' : 'disabled'}><svg class="ic ic-16"><use href="#i-down"/></svg></button>
        <button class="icon-btn sm is-bad" type="button" data-act="del" aria-label="ลบรายการที่ ${i + 1}"><svg class="ic ic-16"><use href="#i-trash"/></svg></button></div>
      <label class="f"><span>ชื่อรายการ</span><input class="input" data-f="t" value="${esc(it.t)}"></label>
      <label class="f"><span>รายละเอียด (บรรทัดละข้อ)</span><textarea class="input" rows="3" data-f="d">${esc(it.d)}</textarea></label>
      <div class="nums">
        <label class="f"><span>จำนวน</span><input class="input" type="number" min="0" step="any" inputmode="decimal" data-f="qty" value="${esc(it.qty)}"></label>
        <label class="f"><span>หน่วย</span><input class="input" data-f="unit" value="${esc(it.unit || '')}"></label>
        <label class="f"><span>ราคา/หน่วย (บาท)</span><input class="input" type="number" min="0" step="any" inputmode="decimal" data-f="price" value="${esc(it.price)}"></label>
      </div>
    </div>`).join('') || '<p class="empty-items">ยังไม่มีรายการ — เลือกแพ็กเกจด้านบน หรือกด "เพิ่มรายการ"</p>';
}

let saveTimer = null;
function changed() {
  DOC.updatedAt = Date.now();
  S.docs[DOC.id] = DOC; S.current = DOC.id;
  render();
  clearTimeout(saveTimer);
  setSaveState('saving', 'กำลังบันทึก…');
  saveTimer = setTimeout(() => { saveStore(); renderSaved(); }, 400);
}

// ===================== ใบที่บันทึก (แผงบนมือถือ + หน้าต่างบนจอกว้าง) =====================
function savedHtml() {
  const docs = Object.values(S.docs).sort((a, b) => b.updatedAt - a.updatedAt);
  const list = docs.map(d => { const t = totals(d); const cur = d.id === DOC.id; return `
    <div class="saved${cur ? ' is-cur' : ''}" data-id="${d.id}">
      <div><b class="mono">${esc(d.no)}</b><small>${esc(d.customer.name || 'ยังไม่ระบุลูกค้า')} · ${money0(t.grand)} บาท · ${thDate(d.date)}</small></div>
      ${cur ? '<span class="hint">กำลังแก้</span>' : `<button class="btn btn-chip" type="button" data-act="open">เปิด</button>`}
      <button class="icon-btn sm is-bad" type="button" data-act="remove" aria-label="ลบ ${esc(d.no)}"><svg class="ic ic-16"><use href="#i-trash"/></svg></button>
    </div>`; }).join('') || '<p class="hint">ยังไม่มี</p>';
  return `<div class="saved-list">${list}</div>
    <button class="btn btn-tonal" type="button" data-act="new"><svg class="ic ic-16"><use href="#i-plus"/></svg>ใบเสนอราคาใหม่</button>
    <p class="hint">บันทึกอัตโนมัติไว้ในเบราว์เซอร์เครื่องนี้ · ย้ายเครื่องหรือสำรองด้วยปุ่มด้านล่าง</p>
    <div class="saved-tools">
      <button class="btn btn-outline" type="button" data-act="export"><svg class="ic ic-16"><use href="#i-download"/></svg>ดาวน์โหลดข้อมูล</button>
      <button class="btn btn-outline" type="button" data-act="import"><svg class="ic ic-16"><use href="#i-upload"/></svg>เปิดไฟล์ข้อมูล</button>
    </div>
    <div class="doc-links"><span class="hint">เอกสารแพ็กเกจสำหรับส่งลูกค้า</span>
      <a href="docs/packages.html" target="_blank" rel="noopener"><svg class="ic ic-16"><use href="#i-doc"/></svg>แพ็กเกจ HR Paper Mill</a>
      <a href="docs/packages-exclusive.html" target="_blank" rel="noopener"><svg class="ic ic-16"><use href="#i-doc"/></svg>แพ็กเกจ Exclusive</a>
    </div>`;
}
function renderSaved() {
  $('savedPanelBody').innerHTML = '<h2>ใบที่บันทึก</h2>' + savedHtml();
  if ($('savedSheet').open) $('savedSheetBody').innerHTML = savedHtml();
}
async function savedAction(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, row = b.closest('[data-id]'), id = row && row.dataset.id;
  if (act === 'open') { openDoc(S.docs[id]); if ($('savedSheet').open) $('savedSheet').close(); setTab('edit'); toast(`เปิด ${S.docs[id].no} แล้ว`); }
  if (act === 'remove') {
    const d = S.docs[id];
    if (!await ask(`ลบใบเสนอราคา ${d.no}?`, `${d.customer.name || 'ยังไม่ระบุลูกค้า'} · ลบแล้วกู้คืนไม่ได้ (ยกเว้นมีไฟล์ข้อมูลที่ดาวน์โหลดไว้)`, 'ลบ', true)) return;
    delete S.docs[id];
    if (id === DOC.id) { const rest = Object.values(S.docs).sort((a, b) => b.updatedAt - a.updatedAt); openDoc(rest[0] || blankDoc()); }
    saveStore(); renderSaved(); toast(`ลบ ${d.no} แล้ว`);
  }
  if (act === 'new') { newDoc(); if ($('savedSheet').open) $('savedSheet').close(); setTab('edit'); }
  if (act === 'export') exportData();
  if (act === 'import') $('fileImport').click();
}

function openDoc(doc) { DOC = doc; S.current = doc.id; fillForm(); render(); renderSaved(); }
function newDoc() { openDoc(blankDoc()); changed(); $('cardTpl').open = true; $('cardCustomer').open = true; toast(`สร้างใบใหม่ ${DOC.no}`); }
function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `softlight-quotes-${todayIso()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('ดาวน์โหลดข้อมูลแล้ว');
}

// ===================== มุมมองบนมือถือ (แก้ไข / ตัวอย่าง / ใบที่บันทึก) =====================
function setTab(tab) {
  document.body.dataset.tab = tab;
  document.querySelectorAll('.bottomnav [data-tab]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.tab === tab)));
  window.scrollTo(0, 0);
  if (tab === 'preview') fitPaper();
}

// ===================== events =====================
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.k) {
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (el.type === 'number' || el.dataset.num !== undefined) v = el.value === '' ? 0 : Number(el.value);
    setK(DOC, el.dataset.k, v); changed();
  } else if (el.dataset.f) {
    const row = el.closest('.item'), i = +row.dataset.i, f = el.dataset.f;
    DOC.items[i][f] = (f === 'qty' || f === 'price') ? (el.value === '' ? 0 : Number(el.value)) : el.value;
    if (f === 'qty' || f === 'price') row.querySelector('.amt').textContent = money(itemAmount(DOC.items[i]));
    changed();
  }
});
document.addEventListener('change', e => { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') e.target.dispatchEvent(new Event('input', { bubbles: true })); });
$('items').addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const i = +b.closest('.item').dataset.i, it = DOC.items;
  if (b.dataset.act === 'del') {
    if (!await ask('ลบรายการนี้?', it[i].t || `รายการที่ ${i + 1}`, 'ลบ', true)) return;
    it.splice(i, 1);
  }
  if (b.dataset.act === 'up' && i) [it[i - 1], it[i]] = [it[i], it[i - 1]];
  if (b.dataset.act === 'down' && i < it.length - 1) [it[i + 1], it[i]] = [it[i], it[i + 1]];
  renderItems(); changed();
});
$('addItem').addEventListener('click', () => {
  DOC.items.push({ t: '', d: '', qty: 1, unit: 'ชุด', price: 0 }); renderItems(); changed();
  const last = $('items').lastElementChild; last.querySelector('input').focus();
  last.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
});
$('priceTier').addEventListener('click', e => {
  const b = e.target.closest('[data-tier]'); if (!b) return;
  TIER = b.dataset.tier;
  $('priceTier').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  renderTemplates();
});
$('tplGrid').addEventListener('click', async e => {
  const b = e.target.closest('[data-tpl]'); if (!b) return;
  if (DOC.items.length && !await ask('ใช้แพ็กเกจนี้?', 'รายการ เงื่อนไข และส่วนลดของใบนี้จะถูกแทนที่ (ข้อมูลลูกค้าและผู้เสนอราคาคงเดิม)', 'ใช้แพ็กเกจนี้')) return;
  applyTemplate(b.dataset.tpl, TIER); fillForm(); changed();
  const t = TEMPLATES.find(x => x.key === b.dataset.tpl);
  toast(`ใช้แพ็กเกจ ${t.label} (${t.note}) แล้ว`);
});

$('btnNew').addEventListener('click', newDoc);
$('btnCopy').addEventListener('click', () => {
  const copy = JSON.parse(JSON.stringify(DOC));
  copy.id = uid(); copy.date = todayIso(); copy.no = nextNo(copy.date); copy.updatedAt = Date.now();
  openDoc(copy); changed(); toast(`ทำสำเนาเป็น ${copy.no} แล้ว`);
});
const doPrint = () => { fitPaper(); window.print(); };
$('btnPrint').addEventListener('click', doPrint);
$('btnPrint2').addEventListener('click', doPrint);
$('saveSeller').addEventListener('click', () => { S.seller = Object.assign({}, DOC.seller); saveStore(); toast('บันทึกแล้ว — ใบใหม่จะใช้ข้อมูลผู้เสนอราคานี้'); });
$('btnSaved').addEventListener('click', () => { $('savedSheetBody').innerHTML = savedHtml(); $('savedSheet').showModal(); });
$('savedSheet').addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target === $('savedSheet')) $('savedSheet').close(); });
$('savedSheetBody').addEventListener('click', savedAction);
$('savedPanelBody').addEventListener('click', savedAction);
$('fileImport').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || typeof data.docs !== 'object') throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
    Object.assign(S.docs, data.docs);
    if (data.seller) S.seller = data.seller;
    Object.entries(data.seq || {}).forEach(([y, n]) => { S.seq[y] = Math.max(S.seq[y] || 0, n); });
    saveStore(); renderSaved(); toast(`นำเข้า ${Object.keys(data.docs).length} ใบแล้ว`);
  } catch (err) { toast('เปิดไฟล์ไม่ได้: ' + err.message); }
  e.target.value = '';
});
document.querySelector('.bottomnav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
$('btnTheme').addEventListener('click', () => {
  const cur = getTheme(), next = THEMES[(THEMES.findIndex(x => x[0] === cur) + 1) % THEMES.length][0];
  try { localStorage.setItem('softlight-theme', next); } catch (e) {}
  applyTheme(next);
  toast('ธีม: ' + THEMES.find(x => x[0] === next)[1]);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(getTheme()));
// ปิดแท็บ/รีเฟรชระหว่างรอบันทึก: บันทึกทันที
window.addEventListener('pagehide', () => { if (saveTimer) { clearTimeout(saveTimer); saveStore(); } });

// ----- เริ่มต้น -----
(function init() {
  applyTheme(getTheme());
  let doc = S.current && S.docs[S.current];
  if (!doc) { doc = blankDoc(); DOC = doc; applyTemplate('standard', 'regular'); S.docs[doc.id] = doc; S.current = doc.id; saveStore(); }
  openDoc(doc);
  setSaveState('ok', 'บันทึกแล้ว');
})();
