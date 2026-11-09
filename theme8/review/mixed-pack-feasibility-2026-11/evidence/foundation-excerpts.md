# Utdrag ur Nyehandels foundation.js

Hämtad 2026-11-06 från `https://hazeyse.nyehandel.se/themes/foundation/js/foundation.js?id=3c32fc4d604db8ed29d958edba4d92ff` (2 324 081 byte, samma bundle laddas på PDP och `/sv/checkout`). Endast utdrag; minifierad tredjepartskod.

## Vuex product-modul: packageVariants + setPackageVariant

`setPackageVariant:function(t,e)` @ offset 166130

```js
geId:function(t,e){t.selected_image_id=e},setVariant:function(t,e){t.variant=e},setSettings:function(t,e){t.settings=e},setPackageVariant:function(t,e){var n=e.key;n>-1?t.packageVariants[n]=e.variant:t.packageVariants.push(e.variant),this._vm.$set(t.packageVariants,n,e.variant)},setProduct:function(t,e){t.product=e},se
```

## Paketplats-komponent (val av variant per plats)

`name:"package-product-variants"` @ offset 792087

```js
name:"package-product-variants",components:{Dropdown:n(15579).A,ProductVariantStatus:c.A,VariantRadio:l.A,VariantButton:a.A,VariantColor:s.A},props:{index:null,productId:null,pivotId:null,optionData:null,selectedVariantId:null,lockedVariant:{type:[Boolean,String],default:!1},quantity:null},data:function(){return{variants:[],options:[],selections:[],matched:null}},watch:{matched:function(t){var e=this.product.images.find((function(e){return e.id==t.image_id})),n=new CustomEvent("pick-n-mix",{detail:{name:"dog",index:this.index,image:e}});document.dispatchEvent(n)},product:function(){this.load()},variant:{handler:function(t){this.variant&&this.selectVariant(this.variant,!1)},deep:!0},options:{handler:function(t){var e=[];this.options.forEach((function(t){t.selected&&e.push(t.selected)})),this.selections=e;this.findMatch()},deep:!0}},computed:{matchable:function(){return!!(this.variants&&this.variants.length>0)},is_locked:function(){return"true"==this.lockedVariant},_selectIndex:function(){return parseInt(this.index)+1}},methods:{load:function(){var t=this;return(0,r.A)((0,i.A)().mark((function e(){var n,r;return(0,i.A)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,o.A.getStateProduct(t.productId,t.selectedVariantId);case 2:n=e.sent,r=n.data,t.product=r.product,t.variants=r.product.variants,t.variants=t.product.variants,t.options=t.product.options,t.init();case 9:case"end":return e.stop()}}),e)})))()},init:function(){this.variants.forEach((function(t){var e=[];t.option_values.forEach((function(t){e.push(t.id)})),t.combos=e}));var t=this.options,e=[],n=this.findVariantById(this.selectedVariantId);n||(n=this.variants[0]),t.forEach((function(t){n.optio
```

## Paketplats utan varianter (fast produkt)

`name:"package-product"` @ offset 789910

```js
name:"package-product",components:{ProductVariantStatus:n(40592).A},props:{productId:null,pivotId:null,variantId:null,quantity:null,selectedVariant:null},data:function(){return{primaryVariant:{}}},computed:{_negativeStatusName:function(){return this.primaryVar
```

## Köpbarhet för paket (bara barnvarianterna)

`computedBuyable:function(){` @ offset 465906

```js
computedBuyable:function(){return!this.variant||(this.product.is_package?!(this.packageVariants.filter((function(t){return 0==t.buyable})).length>0):this.buyable?"true"==this.buyable:this.variant.buyable)},minQuantity:fu
```

## addToCart: payload för paket

`t.product.is_package&&(a=t.packageVariants` @ offset 468053

```js
t.product.is_package&&(a=t.packageVariants.map((function(t){return{id:t.id,pivot_id:t.pivot_id}})),r={data:{packageProductVariants:a}}),t.product.hasOwnProperty("ncs_color")&&t.pro
```

## Varukorgsrad: package_items visas med namn och variantval

`e.isPackage?n("div",{staticClass:"item__package"}` @ offset 482839

```js
e.isPackage?n("div",{staticClass:"item__package"},[n("h5",[e._v(e._s(e.$t("product.package.title")))]),e._v(" "),n("div",{staticClass:"item__package__items"},e._l(e.item.package_items,(function(t){return n("div",{key:t.name},[n("a",{attrs:{href:"/".concat(e.locale,"/products/").concat(t.slug)}},[e._v("\n                            "+e._s(Math.round(t.quantity*e.item.quantity*100)/100)+"\n                            "+e._s(t.unit.title)+" x\n                            "),e.shouldTruncate?n("strong",[e._v(e._s(e._f("truncate")(t.name,25)))]):n("strong",[e._v(e._s(t.name))])]),e._v(" "),e._l(t.option_values,(function(i){return t.has_variants?[n("div",{staticClass:"option"},[n("span",[e._v(e._s
```

## Virtuella paket = prisnivåer för EN variant (ingen blandning)

`addVirtualPackageToCart:function(t)` @ offset 860871

```js
addVirtualPackageToCart:function(t){var e=this;return(0,r.A)((0,i.A)().mark((function n(){var r,s;return(0,i.A)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(s=null===(r=t.target.dataset)||void 0===r?void 0:r.quantity,!e.shouldPreventAddingToCart(s)){n.next=4;break}return e.$toast({type:"is-warning",duration:6e3,msg:e.$t("inventory.not-available"),buttonText:e.$t("close")}),n.abrupt("return");case 4:return t.target.classList.add("is-loading"),n.prev=5,n.next=8,e.$store.dispatch("cart/addVariant",{product_variant_id:e.variant.id,quantity:1,meta:{data:{virtualPackageProductVariants:{id:e.variant.id,quantity:s}}}});case 8:n.next=13;break;case 10:n.prev=10,n.t0=n.catch(5),e.handleCartError(n.t0);case 13:t.target.classList.remove("is-loading");case 14:case"end":return n.stop()}}),n,null,[[5,10]])})))()},shouldPreventAddingToCart:function(t){var e,n,i;return(null===(e=this.product
```
