// CONFIG
const WHATSAPP_NUMBER = "201142044652"; // الرقم الدولي (مهم للواتساب) --> +20 1142044652

// APP STATE
let productsData = []; // شكل: [{category, items:[{name,price}]}]
let currentCategory = null;
let cart = JSON.parse(localStorage.getItem("cart3A")||"[]");
let customer = JSON.parse(localStorage.getItem("cust3A")||"{}");

// DOM
const categoryList = document.getElementById("categoryList");
const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItemsDiv = document.getElementById("cartItems");
const cartTotalSpan = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const custName = document.getElementById("custName");
const custPhone = document.getElementById("custPhone");
const getLocationBtn = document.getElementById("getLocationBtn");
const custLocationP = document.getElementById("custLocation");
const saveCustomerBtn = document.getElementById("saveCustomerBtn");
const adminBtn = document.getElementById("adminBtn");
const adminModal = document.getElementById("adminModal");
const adminPass = document.getElementById("adminPass");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminArea = document.getElementById("adminArea");
const adminProducts = document.getElementById("adminProducts");
const newCategorySelect = document.getElementById("newCategory");
const newName = document.getElementById("newName");
const newPrice = document.getElementById("newPrice");
const addProductBtn = document.getElementById("addProductBtn");
const resetStorageBtn = document.getElementById("resetStorageBtn");
const invoiceContent = document.getElementById("invoiceContent");

// UTIL
function saveCart(){ localStorage.setItem("cart3A", JSON.stringify(cart)); updateCartUI(); }
function saveCustomer(){ localStorage.setItem("cust3A", JSON.stringify(customer)); updateCustomerUI(); }
function updateCartUI(){
  cartCount.innerText = cart.length;
}
function formatPrice(p){ return p && p>0 ? `${p} جنيه` : "سعر - تواصل معنا"; }

// MODAL HANDLING
document.querySelectorAll(".close").forEach(btn=>{
  btn.addEventListener("click", ()=>{ const t=btn.getAttribute("data-target"); document.getElementById(t).style.display="none"; });
});

// load initial products from JSON or from localStorage override
async function loadProducts(){
  const local = localStorage.getItem("products3A");
  if(local){
    productsData = JSON.parse(local);
  } else {
    const res = await fetch("products.json");
    productsData = await res.json();
    localStorage.setItem("products3A", JSON.stringify(productsData));
  }
  renderCategories();
  if(productsData.length>0) showCategory(productsData[0].category);
}

function renderCategories(){
  categoryList.innerHTML = "";
  newCategorySelect.innerHTML = "";
  productsData.forEach(cat=>{
    const li = document.createElement("li");
    li.innerText = cat.category;
    li.onclick = ()=> showCategory(cat.category);
    categoryList.appendChild(li);
    const opt = document.createElement("option");
    opt.value = cat.category;
    opt.innerText = cat.category;
    newCategorySelect.appendChild(opt);
  });
}

function showCategory(catName){
  currentCategory = catName;
  productList.innerHTML = "";
  const cat = productsData.find(c=>c.category === catName);
  if(!cat) return;
  cat.items.forEach(item=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h4>${item.name}</h4>
      <div class="price">${formatPrice(item.price)}</div>
      <div>القسم: ${catName}</div>
      <div>
        <input type="number" min="1" value="1" id="qty_${encodeURIComponent(item.name)}" style="width:70px;padding:6px;margin-top:6px"/>
      </div>
      <button onclick='addToCart("${escapeQuotes(item.name)}", ${item.price})'>أضف للسلة</button>`;
    productList.appendChild(card);
  });
}

function escapeQuotes(s){ return s.replace(/"/g,'\\"').replace(/'/g,"\\'"); }

function addToCart(name, price){
  const qtyEl = document.getElementById(`qty_${encodeURIComponent(name)}`);
  let qty = 1;
  if(qtyEl) qty = parseInt(qtyEl.value) || 1;
  cart.push({name, price, qty});
  saveCart();
  alert("تم إضافة المنتج للسلة");
  renderCartItems();
}

function renderCartItems(){
  cartItemsDiv.innerHTML = "";
  if(cart.length===0) cartItemsDiv.innerHTML = "<p>السلة فارغة</p>";
  let total = 0;
  cart.forEach((it, idx)=>{
    const div = document.createElement("div");
    const itemTotal = (it.price || 0) * (it.qty || 1);
    total += itemTotal;
    div.innerHTML = `<p><strong>${it.name}</strong> | الكمية: <input type="number" min="1" value="${it.qty}" style="width:70px" onchange="updateQty(${idx}, this.value)"/> | السعر: ${formatPrice(it.price)} | المجموع: ${it.price? itemTotal + ' جنيه': '---' } 
      <button onclick="removeFromCart(${idx})">حذف</button></p>`;
    cartItemsDiv.appendChild(div);
  });
  cartTotalSpan.innerText = total;
}

window.updateQty = function(idx, val){
  cart[idx].qty = parseInt(val) || 1;
  saveCart();
  renderCartItems();
}

window.removeFromCart = function(idx){
  if(confirm("حذف المنتج من السلة؟")){
    cart.splice(idx,1);
    saveCart();
    renderCartItems();
  }
}

// SEARCH
searchBtn.addEventListener("click", ()=>{
  const q = searchInput.value.trim();
  if(!q) return showCategory(currentCategory || productsData[0].category);
  productList.innerHTML = "";
  productsData.forEach(cat=>{
    cat.items.filter(i=> i.name.includes(q)).forEach(item=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h4>${item.name}</h4>
        <div class="price">${formatPrice(item.price)}</div>
        <div>القسم: ${cat.category}</div>
        <div>
          <input type="number" min="1" value="1" id="qty_${encodeURIComponent(item.name)}" style="width:70px;padding:6px;margin-top:6px"/>
        </div>
        <button onclick='addToCart("${escapeQuotes(item.name)}", ${item.price})'>أضف للسلة</button>`;
      productList.appendChild(card);
    });
  });
});

// CART MODAL
cartBtn.addEventListener("click", ()=>{
  cartModal.style.display = "flex";
  renderCartItems();
});

// LOGIN / CUSTOMER
loginBtn.addEventListener("click", ()=>{
  loginModal.style.display = "flex";
  custName.value = customer.name || "";
  custPhone.value = customer.phone || "";
  custLocationP.innerText = customer.location || "الموقع: غير محدد";
});

getLocationBtn.addEventListener("click", ()=>{
  if(navigator.geolocation){
    getLocationBtn.innerText = "جاري الحصول على الموقع...";
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      customer.location = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
      custLocationP.innerText = `الموقع: ${customer.location}`;
      getLocationBtn.innerText = "تحديد الموقع (GPS)";
      saveCustomer();
    }, err=>{
      alert("خطأ في تحديد الموقع أو رفض الصلاحية");
      getLocationBtn.innerText = "تحديد الموقع (GPS)";
    });
  } else alert("المتصفح لا يدعم تحديد الموقع");
});

saveCustomerBtn.addEventListener("click", ()=>{
  const n = custName.value.trim();
  const p = custPhone.value.trim();
  if(!n || !p){ alert("ادخل الاسم ورقم الموبايل"); return; }
  customer.name = n; customer.phone = p;
  saveCustomer();
  alert("تم حفظ بيانات العميل");
  loginModal.style.display = "none";
});

// CHECKOUT -> prepare invoice + print + whatsapp
checkoutBtn.addEventListener("click", ()=>{
  if(!customer.name || !customer.phone){
    alert("يجب تسجيل بيانات العميل أولاً");
    loginModal.style.display = "flex";
    return;
  }
  // create invoice html
  const invHtml = generateInvoiceHTML();
  invoiceContent.innerHTML = invHtml;
  // open invoice in new window for printing
  const w = window.open("", "_blank");
  w.document.write(`<html dir="rtl"><head><meta charset="utf-8"><title>فاتورة طلب</title><style>
    body{font-family:Arial, Helvetica, sans-serif;direction:rtl;padding:20px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;text-align:right}
    th{background:#f2f2f2}
    </style></head><body>${invHtml}</body></html>`);
  w.document.close();
  // auto focus print
  w.focus();
  // create whatsapp link
  const waText = generateWhatsAppText();
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
  // alert with links
  const goWA = confirm("سيتم فتح صفحة الفاتورة للطباعة الآن. بعد الطباعة اضغط OK لفتح رسالة واتساب الجاهزة للإرسال.");
  if(goWA){
    window.open(waUrl, "_blank");
  }
  // clear cart
  cart = [];
  saveCart();
  cartModal.style.display = "none";
});

// invoice HTML generator
function generateInvoiceHTML(){
  let total = 0;
  let rows = cart.map((it, idx)=>{
    const unit = it.price || 0;
    const line = unit * (it.qty || 1);
    total += line;
    return `<tr><td>${idx+1}</td><td>${it.name}</td><td>${it.qty||1}</td><td>${unit? unit + ' جنيه' : 'سعر - تواصل'}</td><td>${unit? line + ' جنيه' : '---'}</td></tr>`;
  }).join("");
  const html = `
    <h2>فاتورة طلب - 3A للتجارة</h2>
    <p>اسم العميل: ${customer.name}</p>
    <p>هاتف: ${customer.phone}</p>
    <p>الموقع: ${customer.location || 'غير محدد'}</p>
    <p>طريقة الدفع: ${document.getElementById("paymentMethod").value === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}</p>
    <table>
      <thead><tr><th>م</th><th>المنتج</th><th>الكمية</th><th>سعر واحد</th><th>المجموع</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><th colspan="4">الإجمالي</th><th>${total} جنيه</th></tr></tfoot>
    </table>
    <p>شكراً لتعاملكم مع 3A للتجارة</p>
  `;
  return html;
}

function generateWhatsAppText(){
  let lines = [];
  lines.push(`فاتورة طلب - 3A للتجارة`);
  lines.push(`اسم العميل: ${customer.name}`);
  lines.push(`هاتف: ${customer.phone}`);
  if(customer.location) lines.push(`الموقع: ${customer.location}`);
  lines.push(`طريقة الدفع: ${document.getElementById("paymentMethod").value === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}`);
  lines.push(`---`);
  let total = 0;
  cart.forEach((it, idx)=>{
    const unit = it.price || 0;
    const lineTotal = unit * (it.qty || 1);
    total += lineTotal;
    lines.push(`${idx+1}) ${it.name} ×${it.qty || 1} — ${unit? unit + 'جنيه' : 'سعر - تواصل'} — ${unit? lineTotal + 'جنيه' : ''}`);
  });
  lines.push(`---`);
  lines.push(`الإجمالي: ${total} جنيه`);
  lines.push(`مطلوب: عند الاستلام`);
  lines.push(`شكراً`);
  return lines.join("\n");
}

// ADMIN
adminBtn.addEventListener("click", ()=> { adminModal.style.display = "flex"; });

adminLoginBtn.addEventListener("click", ()=>{
  const pass = adminPass.value;
  if(pass === "3Aadmin"){
    adminArea.style.display = "block";
    loadAdminProducts();
  } else alert("كلمة مرور خاطئة");
});

function loadAdminProducts(){
  adminProducts.innerHTML = "";
  productsData.forEach((cat, ci)=>{
    const div = document.createElement("div");
    div.innerHTML = `<h4>${cat.category}</h4>`;
    cat.items.forEach((it, ii)=>{
      const row = document.createElement("div");
      row.innerHTML = `<input value="${it.name}" data-cat="${ci}" data-idx="${ii}" class="adminName" style="width:40%"/>
        <input type="number" value="${it.price}" data-cat="${ci}" data-idx="${ii}" class="adminPrice" style="width:120px"/>
        <button onclick="removeProduct(${ci},${ii})">حذف</button>`;
      div.appendChild(row);
    });
    adminProducts.appendChild(div);
  });
  // wire update events
  document.querySelectorAll(".adminPrice").forEach(inp=>{
    inp.addEventListener("change", (e)=>{
      const c = e.target.getAttribute("data-cat");
      const i = e.target.getAttribute("data-idx");
      productsData[c].items[i].price = parseFloat(e.target.value)||0;
      persistProducts();
      showCategory(currentCategory || productsData[0].category);
    });
  });
  document.querySelectorAll(".adminName").forEach(inp=>{
    inp.addEventListener("change", (e)=>{
      const c = e.target.getAttribute("data-cat");
      const i = e.target.getAttribute("data-idx");
      productsData[c].items[i].name = e.target.value;
      persistProducts();
      showCategory(currentCategory || productsData[0].category);
    });
  });
}

window.removeProduct = function(catIdx, itemIdx){
  if(confirm("حذف المنتج نهائياً؟")){
    productsData[catIdx].items.splice(itemIdx,1);
    persistProducts();
    loadAdminProducts();
    showCategory(currentCategory || productsData[0].category);
  }
}

addProductBtn.addEventListener("click", ()=>{
  const cat = newCategorySelect.value;
  const name = newName.value.trim();
  const price = parseFloat(newPrice.value) || 0;
  if(!name){ alert("ادخل اسم المنتج"); return; }
  const catObj = productsData.find(c=>c.category===cat);
  if(catObj){
    catObj.items.push({name, price});
    persistProducts();
    loadAdminProducts();
    showCategory(currentCategory || cat);
    newName.value=""; newPrice.value="";
  }
});

resetStorageBtn.addEventListener("click", ()=>{
  if(confirm("ستعاد المنتجات الأساسية من products.json وسيُفقد أي تعديل محلي. متابعة؟")){
    localStorage.removeItem("products3A");
    loadProducts();
    alert("تم استعادة البيانات من products.json");
  }
});

function persistProducts(){
  localStorage.setItem("products3A", JSON.stringify(productsData));
}

// initial load
updateCartUI();
loadProducts();
updateCustomerUI();

function updateCustomerUI(){
  if(customer && customer.name){
    // show abbreviated
    loginBtn.innerText = `حساب: ${customer.name}`;
    custLocationP.innerText = customer.location || 'الموقع: غير محدد';
  } else {
    loginBtn.innerText = 'تسجيل / حسابي';
  }
}
