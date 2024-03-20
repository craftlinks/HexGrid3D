var F=function(A){let K,L;if(K=A.match(/(#|0x)?([a-f0-9]{6})/i))L=K[2];else if(K=A.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))L=parseInt(K[1]).toString(16).padStart(2,0)+parseInt(K[2]).toString(16).padStart(2,0)+parseInt(K[3]).toString(16).padStart(2,0);else if(K=A.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))L=K[1]+K[1]+K[2]+K[2]+K[3]+K[3];if(L)return"#"+L;return!1},l=function(A){return a.find((K)=>K.match(A))},t=function(A){const K=document.createElement("style");K.innerHTML=A;const L=document.querySelector("head link[rel=stylesheet], head style");if(L)document.head.insertBefore(K,L);else document.head.appendChild(K)};class U{constructor(A,K,L,q,h="div"){this.parent=A,this.object=K,this.property=L,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(h),this.domElement.classList.add("controller"),this.domElement.classList.add(q),this.$name=document.createElement("div"),this.$name.classList.add("name"),U.nextNameID=U.nextNameID||0,this.$name.id=`lil-gui-name-${++U.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",(J)=>J.stopPropagation()),this.domElement.addEventListener("keyup",(J)=>J.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(L)}name(A){return this._name=A,this.$name.textContent=A,this}onChange(A){return this._onChange=A,this}_callOnChange(){if(this.parent._callOnChange(this),this._onChange!==void 0)this._onChange.call(this,this.getValue());this._changed=!0}onFinishChange(A){return this._onFinishChange=A,this}_callOnFinishChange(){if(this._changed){if(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0)this._onFinishChange.call(this,this.getValue())}this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(A=!0){return this.disable(!A)}disable(A=!0){if(A===this._disabled)return this;return this._disabled=A,this.domElement.classList.toggle("disabled",A),this.$disable.toggleAttribute("disabled",A),this}show(A=!0){return this._hidden=!A,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(A){const K=this.parent.add(this.object,this.property,A);return K.name(this._name),this.destroy(),K}min(A){return this}max(A){return this}step(A){return this}decimals(A){return this}listen(A=!0){if(this._listening=A,this._listenCallbackID!==void 0)cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0;if(this._listening)this._listenCallback();return this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const A=this.save();if(A!==this._listenPrevValue)this.updateDisplay();this._listenPrevValue=A}getValue(){return this.object[this.property]}setValue(A){if(this.getValue()!==A)this.object[this.property]=A,this._callOnChange(),this.updateDisplay();return this}updateDisplay(){return this}load(A){return this.setValue(A),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class j extends U{constructor(A,K,L){super(A,K,L,"boolean","label");this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}var i={isPrimitive:!0,match:(A)=>typeof A==="string",fromHexString:F,toHexString:F},I={isPrimitive:!0,match:(A)=>typeof A==="number",fromHexString:(A)=>parseInt(A.substring(1),16),toHexString:(A)=>"#"+A.toString(16).padStart(6,0)},n={isPrimitive:!1,match:(A)=>Array.isArray(A),fromHexString(A,K,L=1){const q=I.fromHexString(A);K[0]=(q>>16&255)/255*L,K[1]=(q>>8&255)/255*L,K[2]=(q&255)/255*L},toHexString([A,K,L],q=1){q=255/q;const h=A*q<<16^K*q<<8^L*q<<0;return I.toHexString(h)}},c={isPrimitive:!1,match:(A)=>Object(A)===A,fromHexString(A,K,L=1){const q=I.fromHexString(A);K.r=(q>>16&255)/255*L,K.g=(q>>8&255)/255*L,K.b=(q&255)/255*L},toHexString({r:A,g:K,b:L},q=1){q=255/q;const h=A*q<<16^K*q<<8^L*q<<0;return I.toHexString(h)}},a=[i,I,n,c];class C extends U{constructor(A,K,L,q){super(A,K,L,"color");this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=l(this.initialValue),this._rgbScale=q,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const h=F(this.$text.value);if(h)this._setValueFromHexString(h)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(A){if(this._format.isPrimitive){const K=this._format.fromHexString(A);this.setValue(K)}else this._format.fromHexString(A,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(A){return this._setValueFromHexString(A),this._callOnFinishChange(),this}updateDisplay(){if(this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),!this._textFocused)this.$text.value=this.$input.value.substring(1);return this.$display.style.backgroundColor=this.$input.value,this}}class V extends U{constructor(A,K,L){super(A,K,L,"function");this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",(q)=>{q.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class d extends U{constructor(A,K,L,q,h,J){super(A,K,L,"number");this._initInput(),this.min(q),this.max(h);const P=J!==void 0;this.step(P?J:this._getImplicitStep(),P),this.updateDisplay()}decimals(A){return this._decimals=A,this.updateDisplay(),this}min(A){return this._min=A,this._onUpdateMinMax(),this}max(A){return this._max=A,this._onUpdateMinMax(),this}step(A,K=!0){return this._step=A,this._stepExplicit=K,this}updateDisplay(){const A=this.getValue();if(this._hasSlider){let K=(A-this._min)/(this._max-this._min);K=Math.max(0,Math.min(K,1)),this.$fill.style.width=K*100+"%"}if(!this._inputFocused)this.$input.value=this._decimals===void 0?A:A.toFixed(this._decimals);return this}_initInput(){if(this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches)this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any");this.$widget.appendChild(this.$input),this.$disable=this.$input;const K=()=>{let Z=parseFloat(this.$input.value);if(isNaN(Z))return;if(this._stepExplicit)Z=this._snap(Z);this.setValue(this._clamp(Z))},L=(Z)=>{const z=parseFloat(this.$input.value);if(isNaN(z))return;this._snapClampSetValue(z+Z),this.$input.value=this.getValue()},q=(Z)=>{if(Z.key==="Enter")this.$input.blur();if(Z.code==="ArrowUp")Z.preventDefault(),L(this._step*this._arrowKeyMultiplier(Z));if(Z.code==="ArrowDown")Z.preventDefault(),L(this._step*this._arrowKeyMultiplier(Z)*-1)},h=(Z)=>{if(this._inputFocused)Z.preventDefault(),L(this._step*this._normalizeMouseWheel(Z))};let J=!1,P,E,O,k,$;const Y=5,B=(Z)=>{P=Z.clientX,E=O=Z.clientY,J=!0,k=this.getValue(),$=0,window.addEventListener("mousemove",G),window.addEventListener("mouseup",M)},G=(Z)=>{if(J){const z=Z.clientX-P,D=Z.clientY-E;if(Math.abs(D)>Y)Z.preventDefault(),this.$input.blur(),J=!1,this._setDraggingStyle(!0,"vertical");else if(Math.abs(z)>Y)M()}if(!J){const z=Z.clientY-O;if($-=z*this._step*this._arrowKeyMultiplier(Z),k+$>this._max)$=this._max-k;else if(k+$<this._min)$=this._min-k;this._snapClampSetValue(k+$)}O=Z.clientY},M=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",G),window.removeEventListener("mouseup",M)},X=()=>{this._inputFocused=!0},w=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",K),this.$input.addEventListener("keydown",q),this.$input.addEventListener("wheel",h,{passive:!1}),this.$input.addEventListener("mousedown",B),this.$input.addEventListener("focus",X),this.$input.addEventListener("blur",w)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const A=(w,Z,z,D,T)=>{return(w-Z)/(z-Z)*(T-D)+D},K=(w)=>{const Z=this.$slider.getBoundingClientRect();let z=A(w,Z.left,Z.right,this._min,this._max);this._snapClampSetValue(z)},L=(w)=>{this._setDraggingStyle(!0),K(w.clientX),window.addEventListener("mousemove",q),window.addEventListener("mouseup",h)},q=(w)=>{K(w.clientX)},h=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",q),window.removeEventListener("mouseup",h)};let J=!1,P,E;const O=(w)=>{w.preventDefault(),this._setDraggingStyle(!0),K(w.touches[0].clientX),J=!1},k=(w)=>{if(w.touches.length>1)return;if(this._hasScrollBar)P=w.touches[0].clientX,E=w.touches[0].clientY,J=!0;else O(w);window.addEventListener("touchmove",$,{passive:!1}),window.addEventListener("touchend",Y)},$=(w)=>{if(J){const Z=w.touches[0].clientX-P,z=w.touches[0].clientY-E;if(Math.abs(Z)>Math.abs(z))O(w);else window.removeEventListener("touchmove",$),window.removeEventListener("touchend",Y)}else w.preventDefault(),K(w.touches[0].clientX)},Y=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",$),window.removeEventListener("touchend",Y)},B=this._callOnFinishChange.bind(this),G=400;let M;const X=(w)=>{if(Math.abs(w.deltaX)<Math.abs(w.deltaY)&&this._hasScrollBar)return;w.preventDefault();const z=this._normalizeMouseWheel(w)*this._step;this._snapClampSetValue(this.getValue()+z),this.$input.value=this.getValue(),clearTimeout(M),M=setTimeout(B,G)};this.$slider.addEventListener("mousedown",L),this.$slider.addEventListener("touchstart",k,{passive:!1}),this.$slider.addEventListener("wheel",X,{passive:!1})}_setDraggingStyle(A,K="horizontal"){if(this.$slider)this.$slider.classList.toggle("active",A);document.body.classList.toggle("lil-gui-dragging",A),document.body.classList.toggle(`lil-gui-${K}`,A)}_getImplicitStep(){if(this._hasMin&&this._hasMax)return(this._max-this._min)/1000;return 0.1}_onUpdateMinMax(){if(!this._hasSlider&&this._hasMin&&this._hasMax){if(!this._stepExplicit)this.step(this._getImplicitStep(),!1);this._initSlider(),this.updateDisplay()}}_normalizeMouseWheel(A){let{deltaX:K,deltaY:L}=A;if(Math.floor(A.deltaY)!==A.deltaY&&A.wheelDelta)K=0,L=-A.wheelDelta/120,L*=this._stepExplicit?1:10;return K+-L}_arrowKeyMultiplier(A){let K=this._stepExplicit?1:10;if(A.shiftKey)K*=10;else if(A.altKey)K/=10;return K}_snap(A){const K=Math.round(A/this._step)*this._step;return parseFloat(K.toPrecision(15))}_clamp(A){if(A<this._min)A=this._min;if(A>this._max)A=this._max;return A}_snapClampSetValue(A){this.setValue(this._clamp(this._snap(A)))}get _hasScrollBar(){const A=this.parent.root.$children;return A.scrollHeight>A.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class m extends U{constructor(A,K,L,q){super(A,K,L,"option");this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(q)}options(A){return this._values=Array.isArray(A)?A:Object.values(A),this._names=Array.isArray(A)?A:Object.keys(A),this.$select.replaceChildren(),this._names.forEach((K)=>{const L=document.createElement("option");L.textContent=K,this.$select.appendChild(L)}),this.updateDisplay(),this}updateDisplay(){const A=this.getValue(),K=this._values.indexOf(A);return this.$select.selectedIndex=K,this.$display.textContent=K===-1?A:this._names[K],this}}class g extends U{constructor(A,K,L){super(A,K,L,"string");this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",(q)=>{if(q.code==="Enter")this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var o=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "\u2195";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "\u25BE";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "\u25B8";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "\u2713";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: none;
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
  }
  .lil-gui button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`,S=!1;class x{constructor({parent:A,autoPlace:K=A===void 0,container:L,width:q,title:h="Controls",closeFolders:J=!1,injectStyles:P=!0,touchStyles:E=!0}={}){if(this.parent=A,this.root=A?A.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("div"),this.$title.classList.add("title"),this.$title.setAttribute("role","button"),this.$title.setAttribute("aria-expanded",!0),this.$title.setAttribute("tabindex",0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("keydown",(O)=>{if(O.code==="Enter"||O.code==="Space")O.preventDefault(),this.$title.click()}),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(h),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}if(this.domElement.classList.add("root"),E)this.domElement.classList.add("allow-touch-styles");if(!S&&P)t(o),S=!0;if(L)L.appendChild(this.domElement);else if(K)this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement);if(q)this.domElement.style.setProperty("--width",q+"px");this._closeFolders=J}add(A,K,L,q,h){if(Object(L)===L)return new m(this,A,K,L);const J=A[K];switch(typeof J){case"number":return new d(this,A,K,L,q,h);case"boolean":return new j(this,A,K);case"string":return new g(this,A,K);case"function":return new V(this,A,K)}console.error(`gui.add failed
	property:`,K,`
	object:`,A,`
	value:`,J)}addColor(A,K,L=1){return new C(this,A,K,L)}addFolder(A){const K=new x({parent:this,title:A});if(this.root._closeFolders)K.close();return K}load(A,K=!0){if(A.controllers)this.controllers.forEach((L)=>{if(L instanceof V)return;if(L._name in A.controllers)L.load(A.controllers[L._name])});if(K&&A.folders)this.folders.forEach((L)=>{if(L._title in A.folders)L.load(A.folders[L._title])});return this}save(A=!0){const K={controllers:{},folders:{}};if(this.controllers.forEach((L)=>{if(L instanceof V)return;if(L._name in K.controllers)throw new Error(`Cannot save GUI with duplicate property "${L._name}"`);K.controllers[L._name]=L.save()}),A)this.folders.forEach((L)=>{if(L._title in K.folders)throw new Error(`Cannot save GUI with duplicate folder "${L._title}"`);K.folders[L._title]=L.save()});return K}open(A=!0){return this._setClosed(!A),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}_setClosed(A){if(this._closed===A)return;this._closed=A,this._callOnOpenClose(this)}show(A=!0){return this._hidden=!A,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(A=!0){return this._setClosed(!A),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const K=this.$children.clientHeight;this.$children.style.height=K+"px",this.domElement.classList.add("transition");const L=(h)=>{if(h.target!==this.$children)return;this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",L)};this.$children.addEventListener("transitionend",L);const q=!A?0:this.$children.scrollHeight;this.domElement.classList.toggle("closed",!A),requestAnimationFrame(()=>{this.$children.style.height=q+"px"})}),this}title(A){return this._title=A,this.$title.textContent=A,this}reset(A=!0){return(A?this.controllersRecursive():this.controllers).forEach((L)=>L.reset()),this}onChange(A){return this._onChange=A,this}_callOnChange(A){if(this.parent)this.parent._callOnChange(A);if(this._onChange!==void 0)this._onChange.call(this,{object:A.object,property:A.property,value:A.getValue(),controller:A})}onFinishChange(A){return this._onFinishChange=A,this}_callOnFinishChange(A){if(this.parent)this.parent._callOnFinishChange(A);if(this._onFinishChange!==void 0)this._onFinishChange.call(this,{object:A.object,property:A.property,value:A.getValue(),controller:A})}onOpenClose(A){return this._onOpenClose=A,this}_callOnOpenClose(A){if(this.parent)this.parent._callOnOpenClose(A);if(this._onOpenClose!==void 0)this._onOpenClose.call(this,A)}destroy(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1);if(this.domElement.parentElement)this.domElement.parentElement.removeChild(this.domElement);Array.from(this.children).forEach((A)=>A.destroy())}controllersRecursive(){let A=Array.from(this.controllers);return this.folders.forEach((K)=>{A=A.concat(K.controllersRecursive())}),A}foldersRecursive(){let A=Array.from(this.folders);return this.folders.forEach((K)=>{A=A.concat(K.foldersRecursive())}),A}}var b=x;async function v(){let A={repulsion:2,inertia:0.1,dt:0.1,n_agents:640,K:6,world_extent:15,resetBuffers:()=>{Y()}},L=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!L){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");L.lost.then((Q)=>{if(console.error(`WebGPU device was lost: ${Q.message}`),L=null,Q.reason!=="destroyed")v()});var q=document.querySelector("canvas");const h=await fetch("./shaders/plife_compute.wgsl").then((Q)=>Q.text()),J=L.createBuffer({label:"params buffer",size:Object.keys(A).length*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),P=L.createBuffer({label:"F buffer",size:A.K*A.K*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),E=L.createBuffer({label:"colors buffer",size:A.n_agents*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),O=L.createBuffer({label:"velocities buffer",size:A.n_agents*3*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),k=L.createBuffer({label:"positions buffer",size:A.n_agents*3*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),$=L.createBuffer({label:"Position buffer result",size:A.n_agents*3*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});let Y=()=>{const Q=new Float32Array(A.point_n*3),W=new Float32Array(A.point_n*3),R=new Float32Array(A.point_n);for(let H=0;H<A.point_n;++H)Q[H*3]=(Math.random()-0.5)*100,Q[H*3+1]=(Math.random()-0.5)*100,Q[H*3+2]=0,W[H*3]=0,W[H*3+1]=0,W[H*3+2]=0,R[H]=H%A.K;L.queue.writeBuffer(k,0,Q),L.queue.writeBuffer(O,0,W),L.queue.writeBuffer(E,0,R)};const B=new Float32Array(A.K*A.K);for(let Q=0;Q<A.K;++Q)for(let W=0;W<A.K;++W)B[Q*A.K+W]=(Q==W)+0.1*(Q==(W+1)%A.K);function G(){L.queue.writeBuffer(J,0,new Float32Array(Object.values(A)))}Y(),G();const M=L.createShaderModule({label:"Particle Life Compute Shader",code:h}),X=L.createComputePipeline({label:"compute velocities pipeline",layout:"auto",compute:{module:M,entryPoint:"update_velocities"}}),w=L.createComputePipeline({label:"update positions pipeline",layout:"auto",compute:{module:M,entryPoint:"update_positions"}}),Z=L.createBindGroup({layout:X.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:E}},{binding:1,resource:{buffer:O}},{binding:2,resource:{buffer:k}},{binding:3,resource:{buffer:P}}]}),z=L.createBindGroup({layout:X.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:J}}]});async function D(){const Q=L.createCommandEncoder({label:"our command encoder"}),W=Q.beginComputePass();W.setPipeline(X),W.setBindGroup(0,Z),W.setBindGroup(1,z),W.dispatchWorkgroups(A.n_agents/64),W.end();const R=Q.beginComputePass();R.setPipeline(w),R.setBindGroup(0,Z),R.setBindGroup(1,z),R.dispatchWorkgroups(A.n_agents/64),R.end();const H=Q.finish();L.queue.submit([H])}async function T(Q,W=A.world_extent,R=1){for(let N=0;N<R;++N)await D();const{width:H,height:y}=Q.canvas;Q.resetTransform(),Q.clearRect(0,0,H,y),Q.translate(H/2,y/2);const f=H/W;Q.scale(f,f),Q.lineWidth=0.05;for(let N=0;N<A.point_n;++N){Q.beginPath();const s=positions[N*3],p=positions[N*3+1];Q.arc(s,p,0.075,0,Math.PI*2),ctz.fillStyle=`hsl(${colors[N]*360/A.K}, 100%, 50%)`,Q.fill(),Q.stroke()}}let _=new b;_.add(A,"repulsion").min(0.1).max(5).step(0.1),_.add(A,"inertia").min(0.01).max(1).step(0.01),_.add(A,"dt").min(0.01).max(1).step(0.01),_.add(A,"world_extent").min(5).max(30).step(1),_.add(A,"resetBuffers"),_.onChange(G);const u=e();while(!0)await T(u),await new Promise(requestAnimationFrame)}var r=function(A){let K=window.devicePixelRatio||1,L=A.getBoundingClientRect();A.width=L.width*K,A.height=L.height*K;let q=A.getContext("2d");return q.scale(K,K),q},e=function(){return r(document.querySelector("canvas"))};v();
