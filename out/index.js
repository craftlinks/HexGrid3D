var x=function(A){let q,K;if(q=A.match(/(#|0x)?([a-f0-9]{6})/i))K=q[2];else if(q=A.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))K=parseInt(q[1]).toString(16).padStart(2,0)+parseInt(q[2]).toString(16).padStart(2,0)+parseInt(q[3]).toString(16).padStart(2,0);else if(q=A.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))K=q[1]+q[1]+q[2]+q[2]+q[3]+q[3];if(K)return"#"+K;return!1},o=function(A){return l.find((q)=>q.match(A))},r=function(A){const q=document.createElement("style");q.innerHTML=A;const K=document.querySelector("head link[rel=stylesheet], head style");if(K)document.head.insertBefore(q,K);else document.head.appendChild(q)};class M{constructor(A,q,K,L,J="div"){this.parent=A,this.object=q,this.property=K,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(J),this.domElement.classList.add("controller"),this.domElement.classList.add(L),this.$name=document.createElement("div"),this.$name.classList.add("name"),M.nextNameID=M.nextNameID||0,this.$name.id=`lil-gui-name-${++M.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",(W)=>W.stopPropagation()),this.domElement.addEventListener("keyup",(W)=>W.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(K)}name(A){return this._name=A,this.$name.textContent=A,this}onChange(A){return this._onChange=A,this}_callOnChange(){if(this.parent._callOnChange(this),this._onChange!==void 0)this._onChange.call(this,this.getValue());this._changed=!0}onFinishChange(A){return this._onFinishChange=A,this}_callOnFinishChange(){if(this._changed){if(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0)this._onFinishChange.call(this,this.getValue())}this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(A=!0){return this.disable(!A)}disable(A=!0){if(A===this._disabled)return this;return this._disabled=A,this.domElement.classList.toggle("disabled",A),this.$disable.toggleAttribute("disabled",A),this}show(A=!0){return this._hidden=!A,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(A){const q=this.parent.add(this.object,this.property,A);return q.name(this._name),this.destroy(),q}min(A){return this}max(A){return this}step(A){return this}decimals(A){return this}listen(A=!0){if(this._listening=A,this._listenCallbackID!==void 0)cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0;if(this._listening)this._listenCallback();return this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const A=this.save();if(A!==this._listenPrevValue)this.updateDisplay();this._listenPrevValue=A}getValue(){return this.object[this.property]}setValue(A){if(this.getValue()!==A)this.object[this.property]=A,this._callOnChange(),this.updateDisplay();return this}updateDisplay(){return this}load(A){return this.setValue(A),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class C extends M{constructor(A,q,K){super(A,q,K,"boolean","label");this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}var c={isPrimitive:!0,match:(A)=>typeof A==="string",fromHexString:x,toHexString:x},_={isPrimitive:!0,match:(A)=>typeof A==="number",fromHexString:(A)=>parseInt(A.substring(1),16),toHexString:(A)=>"#"+A.toString(16).padStart(6,0)},n={isPrimitive:!1,match:(A)=>Array.isArray(A),fromHexString(A,q,K=1){const L=_.fromHexString(A);q[0]=(L>>16&255)/255*K,q[1]=(L>>8&255)/255*K,q[2]=(L&255)/255*K},toHexString([A,q,K],L=1){L=255/L;const J=A*L<<16^q*L<<8^K*L<<0;return _.toHexString(J)}},a={isPrimitive:!1,match:(A)=>Object(A)===A,fromHexString(A,q,K=1){const L=_.fromHexString(A);q.r=(L>>16&255)/255*K,q.g=(L>>8&255)/255*K,q.b=(L&255)/255*K},toHexString({r:A,g:q,b:K},L=1){L=255/L;const J=A*L<<16^q*L<<8^K*L<<0;return _.toHexString(J)}},l=[c,_,n,a];class m extends M{constructor(A,q,K,L){super(A,q,K,"color");this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=o(this.initialValue),this._rgbScale=L,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const J=x(this.$text.value);if(J)this._setValueFromHexString(J)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(A){if(this._format.isPrimitive){const q=this._format.fromHexString(A);this.setValue(q)}else this._format.fromHexString(A,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(A){return this._setValueFromHexString(A),this._callOnFinishChange(),this}updateDisplay(){if(this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),!this._textFocused)this.$text.value=this.$input.value.substring(1);return this.$display.style.backgroundColor=this.$input.value,this}}class P extends M{constructor(A,q,K){super(A,q,K,"function");this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",(L)=>{L.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class d extends M{constructor(A,q,K,L,J,W){super(A,q,K,"number");this._initInput(),this.min(L),this.max(J);const O=W!==void 0;this.step(O?W:this._getImplicitStep(),O),this.updateDisplay()}decimals(A){return this._decimals=A,this.updateDisplay(),this}min(A){return this._min=A,this._onUpdateMinMax(),this}max(A){return this._max=A,this._onUpdateMinMax(),this}step(A,q=!0){return this._step=A,this._stepExplicit=q,this}updateDisplay(){const A=this.getValue();if(this._hasSlider){let q=(A-this._min)/(this._max-this._min);q=Math.max(0,Math.min(q,1)),this.$fill.style.width=q*100+"%"}if(!this._inputFocused)this.$input.value=this._decimals===void 0?A:A.toFixed(this._decimals);return this}_initInput(){if(this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches)this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any");this.$widget.appendChild(this.$input),this.$disable=this.$input;const q=()=>{let Z=parseFloat(this.$input.value);if(isNaN(Z))return;if(this._stepExplicit)Z=this._snap(Z);this.setValue(this._clamp(Z))},K=(Z)=>{const z=parseFloat(this.$input.value);if(isNaN(z))return;this._snapClampSetValue(z+Z),this.$input.value=this.getValue()},L=(Z)=>{if(Z.key==="Enter")this.$input.blur();if(Z.code==="ArrowUp")Z.preventDefault(),K(this._step*this._arrowKeyMultiplier(Z));if(Z.code==="ArrowDown")Z.preventDefault(),K(this._step*this._arrowKeyMultiplier(Z)*-1)},J=(Z)=>{if(this._inputFocused)Z.preventDefault(),K(this._step*this._normalizeMouseWheel(Z))};let W=!1,O,N,$,E,H;const k=5,G=(Z)=>{O=Z.clientX,N=$=Z.clientY,W=!0,E=this.getValue(),H=0,window.addEventListener("mousemove",X),window.addEventListener("mouseup",U)},X=(Z)=>{if(W){const z=Z.clientX-O,R=Z.clientY-N;if(Math.abs(R)>k)Z.preventDefault(),this.$input.blur(),W=!1,this._setDraggingStyle(!0,"vertical");else if(Math.abs(z)>k)U()}if(!W){const z=Z.clientY-$;if(H-=z*this._step*this._arrowKeyMultiplier(Z),E+H>this._max)H=this._max-E;else if(E+H<this._min)H=this._min-E;this._snapClampSetValue(E+H)}$=Z.clientY},U=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",X),window.removeEventListener("mouseup",U)},I=()=>{this._inputFocused=!0},Q=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",q),this.$input.addEventListener("keydown",L),this.$input.addEventListener("wheel",J,{passive:!1}),this.$input.addEventListener("mousedown",G),this.$input.addEventListener("focus",I),this.$input.addEventListener("blur",Q)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const A=(Q,Z,z,R,V)=>{return(Q-Z)/(z-Z)*(V-R)+R},q=(Q)=>{const Z=this.$slider.getBoundingClientRect();let z=A(Q,Z.left,Z.right,this._min,this._max);this._snapClampSetValue(z)},K=(Q)=>{this._setDraggingStyle(!0),q(Q.clientX),window.addEventListener("mousemove",L),window.addEventListener("mouseup",J)},L=(Q)=>{q(Q.clientX)},J=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",L),window.removeEventListener("mouseup",J)};let W=!1,O,N;const $=(Q)=>{Q.preventDefault(),this._setDraggingStyle(!0),q(Q.touches[0].clientX),W=!1},E=(Q)=>{if(Q.touches.length>1)return;if(this._hasScrollBar)O=Q.touches[0].clientX,N=Q.touches[0].clientY,W=!0;else $(Q);window.addEventListener("touchmove",H,{passive:!1}),window.addEventListener("touchend",k)},H=(Q)=>{if(W){const Z=Q.touches[0].clientX-O,z=Q.touches[0].clientY-N;if(Math.abs(Z)>Math.abs(z))$(Q);else window.removeEventListener("touchmove",H),window.removeEventListener("touchend",k)}else Q.preventDefault(),q(Q.touches[0].clientX)},k=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",H),window.removeEventListener("touchend",k)},G=this._callOnFinishChange.bind(this),X=400;let U;const I=(Q)=>{if(Math.abs(Q.deltaX)<Math.abs(Q.deltaY)&&this._hasScrollBar)return;Q.preventDefault();const z=this._normalizeMouseWheel(Q)*this._step;this._snapClampSetValue(this.getValue()+z),this.$input.value=this.getValue(),clearTimeout(U),U=setTimeout(G,X)};this.$slider.addEventListener("mousedown",K),this.$slider.addEventListener("touchstart",E,{passive:!1}),this.$slider.addEventListener("wheel",I,{passive:!1})}_setDraggingStyle(A,q="horizontal"){if(this.$slider)this.$slider.classList.toggle("active",A);document.body.classList.toggle("lil-gui-dragging",A),document.body.classList.toggle(`lil-gui-${q}`,A)}_getImplicitStep(){if(this._hasMin&&this._hasMax)return(this._max-this._min)/1000;return 0.1}_onUpdateMinMax(){if(!this._hasSlider&&this._hasMin&&this._hasMax){if(!this._stepExplicit)this.step(this._getImplicitStep(),!1);this._initSlider(),this.updateDisplay()}}_normalizeMouseWheel(A){let{deltaX:q,deltaY:K}=A;if(Math.floor(A.deltaY)!==A.deltaY&&A.wheelDelta)q=0,K=-A.wheelDelta/120,K*=this._stepExplicit?1:10;return q+-K}_arrowKeyMultiplier(A){let q=this._stepExplicit?1:10;if(A.shiftKey)q*=10;else if(A.altKey)q/=10;return q}_snap(A){const q=Math.round(A/this._step)*this._step;return parseFloat(q.toPrecision(15))}_clamp(A){if(A<this._min)A=this._min;if(A>this._max)A=this._max;return A}_snapClampSetValue(A){this.setValue(this._clamp(this._snap(A)))}get _hasScrollBar(){const A=this.parent.root.$children;return A.scrollHeight>A.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class b extends M{constructor(A,q,K,L){super(A,q,K,"option");this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(L)}options(A){return this._values=Array.isArray(A)?A:Object.values(A),this._names=Array.isArray(A)?A:Object.keys(A),this.$select.replaceChildren(),this._names.forEach((q)=>{const K=document.createElement("option");K.textContent=q,this.$select.appendChild(K)}),this.updateDisplay(),this}updateDisplay(){const A=this.getValue(),q=this._values.indexOf(A);return this.$select.selectedIndex=q,this.$display.textContent=q===-1?A:this._names[q],this}}class v extends M{constructor(A,q,K){super(A,q,K,"string");this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",(L)=>{if(L.code==="Enter")this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var t=`.lil-gui {
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
}`,f=!1;class F{constructor({parent:A,autoPlace:q=A===void 0,container:K,width:L,title:J="Controls",closeFolders:W=!1,injectStyles:O=!0,touchStyles:N=!0}={}){if(this.parent=A,this.root=A?A.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("div"),this.$title.classList.add("title"),this.$title.setAttribute("role","button"),this.$title.setAttribute("aria-expanded",!0),this.$title.setAttribute("tabindex",0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("keydown",($)=>{if($.code==="Enter"||$.code==="Space")$.preventDefault(),this.$title.click()}),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(J),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}if(this.domElement.classList.add("root"),N)this.domElement.classList.add("allow-touch-styles");if(!f&&O)r(t),f=!0;if(K)K.appendChild(this.domElement);else if(q)this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement);if(L)this.domElement.style.setProperty("--width",L+"px");this._closeFolders=W}add(A,q,K,L,J){if(Object(K)===K)return new b(this,A,q,K);const W=A[q];switch(typeof W){case"number":return new d(this,A,q,K,L,J);case"boolean":return new C(this,A,q);case"string":return new v(this,A,q);case"function":return new P(this,A,q)}console.error(`gui.add failed
	property:`,q,`
	object:`,A,`
	value:`,W)}addColor(A,q,K=1){return new m(this,A,q,K)}addFolder(A){const q=new F({parent:this,title:A});if(this.root._closeFolders)q.close();return q}load(A,q=!0){if(A.controllers)this.controllers.forEach((K)=>{if(K instanceof P)return;if(K._name in A.controllers)K.load(A.controllers[K._name])});if(q&&A.folders)this.folders.forEach((K)=>{if(K._title in A.folders)K.load(A.folders[K._title])});return this}save(A=!0){const q={controllers:{},folders:{}};if(this.controllers.forEach((K)=>{if(K instanceof P)return;if(K._name in q.controllers)throw new Error(`Cannot save GUI with duplicate property "${K._name}"`);q.controllers[K._name]=K.save()}),A)this.folders.forEach((K)=>{if(K._title in q.folders)throw new Error(`Cannot save GUI with duplicate folder "${K._title}"`);q.folders[K._title]=K.save()});return q}open(A=!0){return this._setClosed(!A),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}_setClosed(A){if(this._closed===A)return;this._closed=A,this._callOnOpenClose(this)}show(A=!0){return this._hidden=!A,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(A=!0){return this._setClosed(!A),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const q=this.$children.clientHeight;this.$children.style.height=q+"px",this.domElement.classList.add("transition");const K=(J)=>{if(J.target!==this.$children)return;this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",K)};this.$children.addEventListener("transitionend",K);const L=!A?0:this.$children.scrollHeight;this.domElement.classList.toggle("closed",!A),requestAnimationFrame(()=>{this.$children.style.height=L+"px"})}),this}title(A){return this._title=A,this.$title.textContent=A,this}reset(A=!0){return(A?this.controllersRecursive():this.controllers).forEach((K)=>K.reset()),this}onChange(A){return this._onChange=A,this}_callOnChange(A){if(this.parent)this.parent._callOnChange(A);if(this._onChange!==void 0)this._onChange.call(this,{object:A.object,property:A.property,value:A.getValue(),controller:A})}onFinishChange(A){return this._onFinishChange=A,this}_callOnFinishChange(A){if(this.parent)this.parent._callOnFinishChange(A);if(this._onFinishChange!==void 0)this._onFinishChange.call(this,{object:A.object,property:A.property,value:A.getValue(),controller:A})}onOpenClose(A){return this._onOpenClose=A,this}_callOnOpenClose(A){if(this.parent)this.parent._callOnOpenClose(A);if(this._onOpenClose!==void 0)this._onOpenClose.call(this,A)}destroy(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1);if(this.domElement.parentElement)this.domElement.parentElement.removeChild(this.domElement);Array.from(this.children).forEach((A)=>A.destroy())}controllersRecursive(){let A=Array.from(this.controllers);return this.folders.forEach((q)=>{A=A.concat(q.controllersRecursive())}),A}foldersRecursive(){let A=Array.from(this.folders);return this.folders.forEach((q)=>{A=A.concat(q.foldersRecursive())}),A}}var g=F;async function e(){let A={mu_k:3.93,sigma_k:1.35,w_k:0.022,mu_g:0.4,sigma_g:0.35,c_rep:0.7,dt:0.17,point_n:12800,resetBuffers:()=>{G()}};const K=await(await navigator.gpu?.requestAdapter())?.requestDevice();if(!K){fail("need a browser that supports WebGPU");return}else console.log("WebGPU is supported");var L=document.querySelector("canvas");const J=await fetch("./shaders/lenia_compute.wgsl").then((h)=>h.text()),W=K.createBuffer({size:Object.keys(A).length*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM}),O=K.createBuffer({label:"Rval buffer",size:A.point_n*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),N=K.createBuffer({label:"Uval buffer",size:A.point_n*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),$=K.createBuffer({label:"Rgrad buffer",size:A.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),E=K.createBuffer({label:"Ugrad buffer",size:A.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC}),H=K.createBuffer({label:"Position buffer",size:A.point_n*2*4,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),k=K.createBuffer({label:"Position buffer result",size:A.point_n*2*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});let G=()=>{const h=new Float32Array(A.point_n*2);for(let w=0;w<A.point_n;++w)h[w*2]=(Math.random()-0.5)*100,h[w*2+1]=(Math.random()-0.5)*100;K.queue.writeBuffer(H,0,h)};function X(){K.queue.writeBuffer(W,0,new Float32Array(Object.values(A)))}G(),X();const U=K.createShaderModule({label:"Lenia Compute Shader",code:J}),I=K.createComputePipeline({label:"reset pipeline",layout:"auto",compute:{module:U,entryPoint:"reset_buffers"}}),Q=K.createComputePipeline({label:"compute fields pipeline",layout:"auto",compute:{module:U,entryPoint:"compute_fields"}}),Z=K.createComputePipeline({label:"update positions pipeline",layout:"auto",compute:{module:U,entryPoint:"update_positions"}}),z=K.createBindGroup({layout:Q.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:O}},{binding:1,resource:{buffer:N}},{binding:2,resource:{buffer:$}},{binding:3,resource:{buffer:E}},{binding:4,resource:{buffer:H}}]}),R=K.createBindGroup({layout:Q.getBindGroupLayout(1),entries:[{binding:0,resource:{buffer:W}}]});async function V(){const h=K.createCommandEncoder({label:"our command encoder"}),w=h.beginComputePass();w.setPipeline(I),w.setBindGroup(0,z),w.setBindGroup(1,R),w.dispatchWorkgroups(A.point_n/64),w.setPipeline(Q),w.setBindGroup(0,z),w.setBindGroup(1,R),w.dispatchWorkgroups(A.point_n/64),w.setPipeline(Z),w.setBindGroup(0,z),w.setBindGroup(1,R),w.dispatchWorkgroups(A.point_n/64),w.end(),h.copyBufferToBuffer(H,0,k,0,k.size);const B=h.finish();K.queue.submit([B])}async function u(h,w=150,B=5){for(let D=0;D<B;++D)await V();await k.mapAsync(GPUMapMode.READ);const y=new Float32Array(k.getMappedRange()),{width:T,height:S}=h.canvas;h.resetTransform(),h.clearRect(0,0,T,S),h.translate(T/2,S/2);const j=T/w;h.scale(j,j),h.lineWidth=0.05;for(let D=0;D<A.point_n;++D){h.beginPath();const i=y[D*2],p=y[D*2+1];h.arc(i,p,0.075,0,Math.PI*2),h.stroke()}k.unmap()}let Y=new g;Y.add(A,"mu_k").min(0.01).max(10).step(0.01),Y.add(A,"sigma_k").min(0.01).max(10).step(0.01),Y.add(A,"w_k").min(0.001).max(10).step(0.001),Y.add(A,"mu_g").min(0.01).max(10).step(0.01),Y.add(A,"sigma_g").min(0.01).max(10).step(0.01),Y.add(A,"c_rep").min(0.01).max(3).step(0.01),Y.add(A,"dt").min(0.01).max(0.25).step(0.01),Y.add(A,"point_n").min(64).max(A.point_n).step(64),Y.add(A,"resetBuffers"),Y.onChange(X);const s=q0();while(!0)await u(s),await new Promise(requestAnimationFrame)}var A0=function(A){let q=window.devicePixelRatio||1,K=A.getBoundingClientRect();A.width=K.width*q,A.height=K.height*q;let L=A.getContext("2d");return L.scale(q,q),L},q0=function(){return A0(document.querySelector("canvas"))};e();
