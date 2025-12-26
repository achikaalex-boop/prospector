import{B as N,s as U,f as q,c as f,o as l,a as x,b as y,r as C,m as p,d as V,e as i,t as g,g as J,h as se,i as Q,j as le,k as L,R as de,v as ue,C as ce,l as pe,S as me,_ as fe,n as Z,x as P,W as ge,p as ye,q as W,u as _,w as h,y as m,T as be,z as ee,F as te,A as he,D as w,E as S,G as ve,H as c,I as Ce,J as I,K as we}from"./index-DyKjiNTS.js";import{s as j}from"./index-CEWVN2FF.js";import{s as ke,a as xe,b as De}from"./index-B3OGENJt.js";import{F as ze,s as Le,a as O}from"./index-CCB8tQU0.js";import{s as T}from"./index-BsMgJBjo.js";var Se=`
    .p-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: dt('tag.primary.background');
        color: dt('tag.primary.color');
        font-size: dt('tag.font.size');
        font-weight: dt('tag.font.weight');
        padding: dt('tag.padding');
        border-radius: dt('tag.border.radius');
        gap: dt('tag.gap');
    }

    .p-tag-icon {
        font-size: dt('tag.icon.size');
        width: dt('tag.icon.size');
        height: dt('tag.icon.size');
    }

    .p-tag-rounded {
        border-radius: dt('tag.rounded.border.radius');
    }

    .p-tag-success {
        background: dt('tag.success.background');
        color: dt('tag.success.color');
    }

    .p-tag-info {
        background: dt('tag.info.background');
        color: dt('tag.info.color');
    }

    .p-tag-warn {
        background: dt('tag.warn.background');
        color: dt('tag.warn.color');
    }

    .p-tag-danger {
        background: dt('tag.danger.background');
        color: dt('tag.danger.color');
    }

    .p-tag-secondary {
        background: dt('tag.secondary.background');
        color: dt('tag.secondary.color');
    }

    .p-tag-contrast {
        background: dt('tag.contrast.background');
        color: dt('tag.contrast.color');
    }
`,Ee={root:function(t){var n=t.props;return["p-tag p-component",{"p-tag-info":n.severity==="info","p-tag-success":n.severity==="success","p-tag-warn":n.severity==="warn","p-tag-danger":n.severity==="danger","p-tag-secondary":n.severity==="secondary","p-tag-contrast":n.severity==="contrast","p-tag-rounded":n.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},Be=N.extend({name:"tag",style:Se,classes:Ee}),$e={name:"BaseTag",extends:U,props:{value:null,severity:null,rounded:Boolean,icon:String},style:Be,provide:function(){return{$pcTag:this,$parentInstance:this}}};function E(e){"@babel/helpers - typeof";return E=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},E(e)}function Ae(e,t,n){return(t=Me(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Me(e){var t=Ie(e,"string");return E(t)=="symbol"?t:t+""}function Ie(e,t){if(E(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var a=n.call(e,t);if(E(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var R={name:"Tag",extends:$e,inheritAttrs:!1,computed:{dataP:function(){return q(Ae({rounded:this.rounded},this.severity,this.severity))}}},Pe=["data-p"];function je(e,t,n,a,d,r){return l(),f("span",p({class:e.cx("root"),"data-p":r.dataP},e.ptmi("root")),[e.$slots.icon?(l(),x(V(e.$slots.icon),p({key:0,class:e.cx("icon")},e.ptm("icon")),null,16,["class"])):e.icon?(l(),f("span",p({key:1,class:[e.cx("icon"),e.icon]},e.ptm("icon")),null,16)):y("",!0),e.value!=null||e.$slots.default?C(e.$slots,"default",{key:2},function(){return[i("span",p({class:e.cx("label")},e.ptm("label")),g(e.value),17)]}):y("",!0)],16,Pe)}R.render=je;var Oe=`
    .p-progressspinner {
        position: relative;
        margin: 0 auto;
        width: 100px;
        height: 100px;
        display: inline-block;
    }

    .p-progressspinner::before {
        content: '';
        display: block;
        padding-top: 100%;
    }

    .p-progressspinner-spin {
        height: 100%;
        transform-origin: center center;
        width: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        animation: p-progressspinner-rotate 2s linear infinite;
    }

    .p-progressspinner-circle {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: 0;
        stroke: dt('progressspinner.colorOne');
        animation:
            p-progressspinner-dash 1.5s ease-in-out infinite,
            p-progressspinner-color 6s ease-in-out infinite;
        stroke-linecap: round;
    }

    @keyframes p-progressspinner-rotate {
        100% {
            transform: rotate(360deg);
        }
    }
    @keyframes p-progressspinner-dash {
        0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
        }
        100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
        }
    }
    @keyframes p-progressspinner-color {
        100%,
        0% {
            stroke: dt('progressspinner.color.one');
        }
        40% {
            stroke: dt('progressspinner.color.two');
        }
        66% {
            stroke: dt('progressspinner.color.three');
        }
        80%,
        90% {
            stroke: dt('progressspinner.color.four');
        }
    }
`,Te={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Ve=N.extend({name:"progressspinner",style:Oe,classes:Te}),Re={name:"BaseProgressSpinner",extends:U,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:Ve,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},ne={name:"ProgressSpinner",extends:Re,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},He=["fill","stroke-width"];function Ke(e,t,n,a,d,r){return l(),f("div",p({class:e.cx("root"),role:"progressbar"},e.ptmi("root")),[(l(),f("svg",p({class:e.cx("spin"),viewBox:"25 25 50 50",style:r.svgStyle},e.ptm("spin")),[i("circle",p({class:e.cx("circle"),cx:"50",cy:"50",r:"20",fill:e.fill,"stroke-width":e.strokeWidth,strokeMiterlimit:"10"},e.ptm("circle")),null,16,He)],16))],16)}ne.render=Ke;var oe={name:"WindowMaximizeIcon",extends:J};function Ne(e){return Xe(e)||We(e)||Ze(e)||Ue()}function Ue(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ze(e,t){if(e){if(typeof e=="string")return H(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?H(e,t):void 0}}function We(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Xe(e){if(Array.isArray(e))return H(e)}function H(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,a=Array(t);n<t;n++)a[n]=e[n];return a}function Ye(e,t,n,a,d,r){return l(),f("svg",p({width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e.pti()),Ne(t[0]||(t[0]=[i("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14ZM9.77805 7.42192C9.89013 7.534 10.0415 7.59788 10.2 7.59995C10.3585 7.59788 10.5099 7.534 10.622 7.42192C10.7341 7.30985 10.798 7.15844 10.8 6.99995V3.94242C10.8066 3.90505 10.8096 3.86689 10.8089 3.82843C10.8079 3.77159 10.7988 3.7157 10.7824 3.6623C10.756 3.55552 10.701 3.45698 10.622 3.37798C10.5099 3.2659 10.3585 3.20202 10.2 3.19995H7.00002C6.84089 3.19995 6.68828 3.26317 6.57576 3.37569C6.46324 3.48821 6.40002 3.64082 6.40002 3.79995C6.40002 3.95908 6.46324 4.11169 6.57576 4.22422C6.68828 4.33674 6.84089 4.39995 7.00002 4.39995H8.80006L6.19997 7.00005C6.10158 7.11005 6.04718 7.25246 6.04718 7.40005C6.04718 7.54763 6.10158 7.69004 6.19997 7.80005C6.30202 7.91645 6.44561 7.98824 6.59997 8.00005C6.75432 7.98824 6.89791 7.91645 6.99997 7.80005L9.60002 5.26841V6.99995C9.6021 7.15844 9.66598 7.30985 9.77805 7.42192ZM1.4 14H3.8C4.17066 13.9979 4.52553 13.8498 4.78763 13.5877C5.04973 13.3256 5.1979 12.9707 5.2 12.6V10.2C5.1979 9.82939 5.04973 9.47452 4.78763 9.21242C4.52553 8.95032 4.17066 8.80215 3.8 8.80005H1.4C1.02934 8.80215 0.674468 8.95032 0.412371 9.21242C0.150274 9.47452 0.00210008 9.82939 0 10.2V12.6C0.00210008 12.9707 0.150274 13.3256 0.412371 13.5877C0.674468 13.8498 1.02934 13.9979 1.4 14ZM1.25858 10.0586C1.29609 10.0211 1.34696 10 1.4 10H3.8C3.85304 10 3.90391 10.0211 3.94142 10.0586C3.97893 10.0961 4 10.147 4 10.2V12.6C4 12.6531 3.97893 12.704 3.94142 12.7415C3.90391 12.779 3.85304 12.8 3.8 12.8H1.4C1.34696 12.8 1.29609 12.779 1.25858 12.7415C1.22107 12.704 1.2 12.6531 1.2 12.6V10.2C1.2 10.147 1.22107 10.0961 1.25858 10.0586Z",fill:"currentColor"},null,-1)])),16)}oe.render=Ye;var ie={name:"WindowMinimizeIcon",extends:J};function Fe(e){return Qe(e)||Je(e)||qe(e)||Ge()}function Ge(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function qe(e,t){if(e){if(typeof e=="string")return K(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?K(e,t):void 0}}function Je(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Qe(e){if(Array.isArray(e))return K(e)}function K(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,a=Array(t);n<t;n++)a[n]=e[n];return a}function _e(e,t,n,a,d,r){return l(),f("svg",p({width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg"},e.pti()),Fe(t[0]||(t[0]=[i("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M11.8 0H2.2C1.61652 0 1.05694 0.231785 0.644365 0.644365C0.231785 1.05694 0 1.61652 0 2.2V7C0 7.15913 0.063214 7.31174 0.175736 7.42426C0.288258 7.53679 0.44087 7.6 0.6 7.6C0.75913 7.6 0.911742 7.53679 1.02426 7.42426C1.13679 7.31174 1.2 7.15913 1.2 7V2.2C1.2 1.93478 1.30536 1.68043 1.49289 1.49289C1.68043 1.30536 1.93478 1.2 2.2 1.2H11.8C12.0652 1.2 12.3196 1.30536 12.5071 1.49289C12.6946 1.68043 12.8 1.93478 12.8 2.2V11.8C12.8 12.0652 12.6946 12.3196 12.5071 12.5071C12.3196 12.6946 12.0652 12.8 11.8 12.8H7C6.84087 12.8 6.68826 12.8632 6.57574 12.9757C6.46321 13.0883 6.4 13.2409 6.4 13.4C6.4 13.5591 6.46321 13.7117 6.57574 13.8243C6.68826 13.9368 6.84087 14 7 14H11.8C12.3835 14 12.9431 13.7682 13.3556 13.3556C13.7682 12.9431 14 12.3835 14 11.8V2.2C14 1.61652 13.7682 1.05694 13.3556 0.644365C12.9431 0.231785 12.3835 0 11.8 0ZM6.368 7.952C6.44137 7.98326 6.52025 7.99958 6.6 8H9.8C9.95913 8 10.1117 7.93678 10.2243 7.82426C10.3368 7.71174 10.4 7.55913 10.4 7.4C10.4 7.24087 10.3368 7.08826 10.2243 6.97574C10.1117 6.86321 9.95913 6.8 9.8 6.8H8.048L10.624 4.224C10.73 4.11026 10.7877 3.95982 10.7849 3.80438C10.7822 3.64894 10.7192 3.50063 10.6093 3.3907C10.4994 3.28077 10.3511 3.2178 10.1956 3.21506C10.0402 3.21232 9.88974 3.27002 9.776 3.376L7.2 5.952V4.2C7.2 4.04087 7.13679 3.88826 7.02426 3.77574C6.91174 3.66321 6.75913 3.6 6.6 3.6C6.44087 3.6 6.28826 3.66321 6.17574 3.77574C6.06321 3.88826 6 4.04087 6 4.2V7.4C6.00042 7.47975 6.01674 7.55862 6.048 7.632C6.07656 7.70442 6.11971 7.7702 6.17475 7.82524C6.2298 7.88029 6.29558 7.92344 6.368 7.952ZM1.4 8.80005H3.8C4.17066 8.80215 4.52553 8.95032 4.78763 9.21242C5.04973 9.47452 5.1979 9.82939 5.2 10.2V12.6C5.1979 12.9707 5.04973 13.3256 4.78763 13.5877C4.52553 13.8498 4.17066 13.9979 3.8 14H1.4C1.02934 13.9979 0.674468 13.8498 0.412371 13.5877C0.150274 13.3256 0.00210008 12.9707 0 12.6V10.2C0.00210008 9.82939 0.150274 9.47452 0.412371 9.21242C0.674468 8.95032 1.02934 8.80215 1.4 8.80005ZM3.94142 12.7415C3.97893 12.704 4 12.6531 4 12.6V10.2C4 10.147 3.97893 10.0961 3.94142 10.0586C3.90391 10.0211 3.85304 10 3.8 10H1.4C1.34696 10 1.29609 10.0211 1.25858 10.0586C1.22107 10.0961 1.2 10.147 1.2 10.2V12.6C1.2 12.6531 1.22107 12.704 1.25858 12.7415C1.29609 12.779 1.34696 12.8 1.4 12.8H3.8C3.85304 12.8 3.90391 12.779 3.94142 12.7415Z",fill:"currentColor"},null,-1)])),16)}ie.render=_e;function X(){le({variableName:Q("scrollbar.width").name})}function Y(){se({variableName:Q("scrollbar.width").name})}var et=`
    .p-dialog {
        max-height: 90%;
        transform: scale(1);
        border-radius: dt('dialog.border.radius');
        box-shadow: dt('dialog.shadow');
        background: dt('dialog.background');
        border: 1px solid dt('dialog.border.color');
        color: dt('dialog.color');
        will-change: transform;
    }

    .p-dialog-content {
        overflow-y: auto;
        padding: dt('dialog.content.padding');
    }

    .p-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        padding: dt('dialog.header.padding');
    }

    .p-dialog-title {
        font-weight: dt('dialog.title.font.weight');
        font-size: dt('dialog.title.font.size');
    }

    .p-dialog-footer {
        flex-shrink: 0;
        padding: dt('dialog.footer.padding');
        display: flex;
        justify-content: flex-end;
        gap: dt('dialog.footer.gap');
    }

    .p-dialog-header-actions {
        display: flex;
        align-items: center;
        gap: dt('dialog.header.gap');
    }

    .p-dialog-top .p-dialog,
    .p-dialog-bottom .p-dialog,
    .p-dialog-left .p-dialog,
    .p-dialog-right .p-dialog,
    .p-dialog-topleft .p-dialog,
    .p-dialog-topright .p-dialog,
    .p-dialog-bottomleft .p-dialog,
    .p-dialog-bottomright .p-dialog {
        margin: 1rem;
    }

    .p-dialog-maximized {
        width: 100vw !important;
        height: 100vh !important;
        top: 0px !important;
        left: 0px !important;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
    }

    .p-dialog-maximized .p-dialog-content {
        flex-grow: 1;
    }

    .p-dialog .p-resizable-handle {
        position: absolute;
        font-size: 0.1px;
        display: block;
        cursor: se-resize;
        width: 12px;
        height: 12px;
        right: 1px;
        bottom: 1px;
    }

    .p-dialog-enter-active {
        animation: p-animate-dialog-enter 300ms cubic-bezier(.19,1,.22,1);
    }

    .p-dialog-leave-active {
        animation: p-animate-dialog-leave 300ms cubic-bezier(.19,1,.22,1);
    }

    @keyframes p-animate-dialog-enter {
        from {
            opacity: 0;
            transform: scale(0.93);
        }
    }

    @keyframes p-animate-dialog-leave {
        to {
            opacity: 0;
            transform: scale(0.93);
        }
    }
`,tt={mask:function(t){var n=t.position,a=t.modal;return{position:"fixed",height:"100%",width:"100%",left:0,top:0,display:"flex",justifyContent:n==="left"||n==="topleft"||n==="bottomleft"?"flex-start":n==="right"||n==="topright"||n==="bottomright"?"flex-end":"center",alignItems:n==="top"||n==="topleft"||n==="topright"?"flex-start":n==="bottom"||n==="bottomleft"||n==="bottomright"?"flex-end":"center",pointerEvents:a?"auto":"none"}},root:{display:"flex",flexDirection:"column",pointerEvents:"auto"}},nt={mask:function(t){var n=t.props,a=["left","right","top","topleft","topright","bottom","bottomleft","bottomright"],d=a.find(function(r){return r===n.position});return["p-dialog-mask",{"p-overlay-mask p-overlay-mask-enter-active":n.modal},d?"p-dialog-".concat(d):""]},root:function(t){var n=t.props,a=t.instance;return["p-dialog p-component",{"p-dialog-maximized":n.maximizable&&a.maximized}]},header:"p-dialog-header",title:"p-dialog-title",headerActions:"p-dialog-header-actions",pcMaximizeButton:"p-dialog-maximize-button",pcCloseButton:"p-dialog-close-button",content:"p-dialog-content",footer:"p-dialog-footer"},ot=N.extend({name:"dialog",style:et,classes:nt,inlineStyles:tt}),it={name:"BaseDialog",extends:U,props:{header:{type:null,default:null},footer:{type:null,default:null},visible:{type:Boolean,default:!1},modal:{type:Boolean,default:null},contentStyle:{type:null,default:null},contentClass:{type:String,default:null},contentProps:{type:null,default:null},maximizable:{type:Boolean,default:!1},dismissableMask:{type:Boolean,default:!1},closable:{type:Boolean,default:!0},closeOnEscape:{type:Boolean,default:!0},showHeader:{type:Boolean,default:!0},blockScroll:{type:Boolean,default:!1},baseZIndex:{type:Number,default:0},autoZIndex:{type:Boolean,default:!0},position:{type:String,default:"center"},breakpoints:{type:Object,default:null},draggable:{type:Boolean,default:!0},keepInViewport:{type:Boolean,default:!0},minX:{type:Number,default:0},minY:{type:Number,default:0},appendTo:{type:[String,Object],default:"body"},closeIcon:{type:String,default:void 0},maximizeIcon:{type:String,default:void 0},minimizeIcon:{type:String,default:void 0},closeButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}},maximizeButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}},_instance:null},style:ot,provide:function(){return{$pcDialog:this,$parentInstance:this}}},re={name:"Dialog",extends:it,inheritAttrs:!1,emits:["update:visible","show","hide","after-hide","maximize","unmaximize","dragstart","dragend"],provide:function(){var t=this;return{dialogRef:ye(function(){return t._instance})}},data:function(){return{containerVisible:this.visible,maximized:!1,focusableMax:null,focusableClose:null,target:null}},documentKeydownListener:null,container:null,mask:null,content:null,headerContainer:null,footerContainer:null,maximizableButton:null,closeButton:null,styleElement:null,dragging:null,documentDragListener:null,documentDragEndListener:null,lastPageX:null,lastPageY:null,maskMouseDownTarget:null,updated:function(){this.visible&&(this.containerVisible=this.visible)},beforeUnmount:function(){this.unbindDocumentState(),this.unbindGlobalListeners(),this.destroyStyle(),this.mask&&this.autoZIndex&&P.clear(this.mask),this.container=null,this.mask=null},mounted:function(){this.breakpoints&&this.createStyle()},methods:{close:function(){this.$emit("update:visible",!1)},onEnter:function(){this.$emit("show"),this.target=document.activeElement,this.enableDocumentSettings(),this.bindGlobalListeners(),this.autoZIndex&&P.set("modal",this.mask,this.baseZIndex+this.$primevue.config.zIndex.modal)},onAfterEnter:function(){this.focus()},onBeforeLeave:function(){this.modal&&!this.isUnstyled&&ge(this.mask,"p-overlay-mask-leave-active"),this.dragging&&this.documentDragEndListener&&this.documentDragEndListener()},onLeave:function(){this.$emit("hide"),Z(this.target),this.target=null,this.focusableClose=null,this.focusableMax=null},onAfterLeave:function(){this.autoZIndex&&P.clear(this.mask),this.containerVisible=!1,this.unbindDocumentState(),this.unbindGlobalListeners(),this.$emit("after-hide")},onMaskMouseDown:function(t){this.maskMouseDownTarget=t.target},onMaskMouseUp:function(){this.dismissableMask&&this.modal&&this.mask===this.maskMouseDownTarget&&this.close()},focus:function(){var t=function(d){return d&&d.querySelector("[autofocus]")},n=this.$slots.footer&&t(this.footerContainer);n||(n=this.$slots.header&&t(this.headerContainer),n||(n=this.$slots.default&&t(this.content),n||(this.maximizable?(this.focusableMax=!0,n=this.maximizableButton):(this.focusableClose=!0,n=this.closeButton)))),n&&Z(n,{focusVisible:!0})},maximize:function(t){this.maximized?(this.maximized=!1,this.$emit("unmaximize",t)):(this.maximized=!0,this.$emit("maximize",t)),this.modal||(this.maximized?X():Y())},enableDocumentSettings:function(){(this.modal||!this.modal&&this.blockScroll||this.maximizable&&this.maximized)&&X()},unbindDocumentState:function(){(this.modal||!this.modal&&this.blockScroll||this.maximizable&&this.maximized)&&Y()},onKeyDown:function(t){t.code==="Escape"&&this.closeOnEscape&&this.close()},bindDocumentKeyDownListener:function(){this.documentKeydownListener||(this.documentKeydownListener=this.onKeyDown.bind(this),window.document.addEventListener("keydown",this.documentKeydownListener))},unbindDocumentKeyDownListener:function(){this.documentKeydownListener&&(window.document.removeEventListener("keydown",this.documentKeydownListener),this.documentKeydownListener=null)},containerRef:function(t){this.container=t},maskRef:function(t){this.mask=t},contentRef:function(t){this.content=t},headerContainerRef:function(t){this.headerContainer=t},footerContainerRef:function(t){this.footerContainer=t},maximizableRef:function(t){this.maximizableButton=t?t.$el:void 0},closeButtonRef:function(t){this.closeButton=t?t.$el:void 0},createStyle:function(){if(!this.styleElement&&!this.isUnstyled){var t;this.styleElement=document.createElement("style"),this.styleElement.type="text/css",fe(this.styleElement,"nonce",(t=this.$primevue)===null||t===void 0||(t=t.config)===null||t===void 0||(t=t.csp)===null||t===void 0?void 0:t.nonce),document.head.appendChild(this.styleElement);var n="";for(var a in this.breakpoints)n+=`
                        @media screen and (max-width: `.concat(a,`) {
                            .p-dialog[`).concat(this.$attrSelector,`] {
                                width: `).concat(this.breakpoints[a],` !important;
                            }
                        }
                    `);this.styleElement.innerHTML=n}},destroyStyle:function(){this.styleElement&&(document.head.removeChild(this.styleElement),this.styleElement=null)},initDrag:function(t){t.target.closest("div").getAttribute("data-pc-section")!=="headeractions"&&this.draggable&&(this.dragging=!0,this.lastPageX=t.pageX,this.lastPageY=t.pageY,this.container.style.margin="0",document.body.setAttribute("data-p-unselectable-text","true"),!this.isUnstyled&&me(document.body,{"user-select":"none"}),this.$emit("dragstart",t))},bindGlobalListeners:function(){this.draggable&&(this.bindDocumentDragListener(),this.bindDocumentDragEndListener()),this.closeOnEscape&&this.bindDocumentKeyDownListener()},unbindGlobalListeners:function(){this.unbindDocumentDragListener(),this.unbindDocumentDragEndListener(),this.unbindDocumentKeyDownListener()},bindDocumentDragListener:function(){var t=this;this.documentDragListener=function(n){if(t.dragging){var a=ue(t.container),d=ce(t.container),r=n.pageX-t.lastPageX,D=n.pageY-t.lastPageY,z=t.container.getBoundingClientRect(),v=z.left+r,b=z.top+D,k=pe(),$=getComputedStyle(t.container),A=parseFloat($.marginLeft),s=parseFloat($.marginTop);t.container.style.position="fixed",t.keepInViewport?(v>=t.minX&&v+a<k.width&&(t.lastPageX=n.pageX,t.container.style.left=v-A+"px"),b>=t.minY&&b+d<k.height&&(t.lastPageY=n.pageY,t.container.style.top=b-s+"px")):(t.lastPageX=n.pageX,t.container.style.left=v-A+"px",t.lastPageY=n.pageY,t.container.style.top=b-s+"px")}},window.document.addEventListener("mousemove",this.documentDragListener)},unbindDocumentDragListener:function(){this.documentDragListener&&(window.document.removeEventListener("mousemove",this.documentDragListener),this.documentDragListener=null)},bindDocumentDragEndListener:function(){var t=this;this.documentDragEndListener=function(n){t.dragging&&(t.dragging=!1,document.body.removeAttribute("data-p-unselectable-text"),!t.isUnstyled&&(document.body.style["user-select"]=""),t.$emit("dragend",n))},window.document.addEventListener("mouseup",this.documentDragEndListener)},unbindDocumentDragEndListener:function(){this.documentDragEndListener&&(window.document.removeEventListener("mouseup",this.documentDragEndListener),this.documentDragEndListener=null)}},computed:{maximizeIconComponent:function(){return this.maximized?this.minimizeIcon?"span":"WindowMinimizeIcon":this.maximizeIcon?"span":"WindowMaximizeIcon"},ariaLabelledById:function(){return this.header!=null||this.$attrs["aria-labelledby"]!==null?this.$id+"_header":null},closeAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.close:void 0},dataP:function(){return q({maximized:this.maximized,modal:this.modal})}},directives:{ripple:de,focustrap:ze},components:{Button:L,Portal:xe,WindowMinimizeIcon:ie,WindowMaximizeIcon:oe,TimesIcon:ke}};function B(e){"@babel/helpers - typeof";return B=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},B(e)}function F(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(d){return Object.getOwnPropertyDescriptor(e,d).enumerable})),n.push.apply(n,a)}return n}function G(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?F(Object(n),!0).forEach(function(a){rt(e,a,n[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):F(Object(n)).forEach(function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(n,a))})}return e}function rt(e,t,n){return(t=at(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function at(e){var t=st(e,"string");return B(t)=="symbol"?t:t+""}function st(e,t){if(B(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var a=n.call(e,t);if(B(a)!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var lt=["data-p"],dt=["aria-labelledby","aria-modal","data-p"],ut=["id"],ct=["data-p"];function pt(e,t,n,a,d,r){var D=W("Button"),z=W("Portal"),v=_("focustrap");return l(),x(z,{appendTo:e.appendTo},{default:h(function(){return[d.containerVisible?(l(),f("div",p({key:0,ref:r.maskRef,class:e.cx("mask"),style:e.sx("mask",!0,{position:e.position,modal:e.modal}),onMousedown:t[1]||(t[1]=function(){return r.onMaskMouseDown&&r.onMaskMouseDown.apply(r,arguments)}),onMouseup:t[2]||(t[2]=function(){return r.onMaskMouseUp&&r.onMaskMouseUp.apply(r,arguments)}),"data-p":r.dataP},e.ptm("mask")),[m(be,p({name:"p-dialog",onEnter:r.onEnter,onAfterEnter:r.onAfterEnter,onBeforeLeave:r.onBeforeLeave,onLeave:r.onLeave,onAfterLeave:r.onAfterLeave,appear:""},e.ptm("transition")),{default:h(function(){return[e.visible?ee((l(),f("div",p({key:0,ref:r.containerRef,class:e.cx("root"),style:e.sx("root"),role:"dialog","aria-labelledby":r.ariaLabelledById,"aria-modal":e.modal,"data-p":r.dataP},e.ptmi("root")),[e.$slots.container?C(e.$slots,"container",{key:0,closeCallback:r.close,maximizeCallback:function(k){return r.maximize(k)},initDragCallback:r.initDrag}):(l(),f(te,{key:1},[e.showHeader?(l(),f("div",p({key:0,ref:r.headerContainerRef,class:e.cx("header"),onMousedown:t[0]||(t[0]=function(){return r.initDrag&&r.initDrag.apply(r,arguments)})},e.ptm("header")),[C(e.$slots,"header",{class:he(e.cx("title"))},function(){return[e.header?(l(),f("span",p({key:0,id:r.ariaLabelledById,class:e.cx("title")},e.ptm("title")),g(e.header),17,ut)):y("",!0)]}),i("div",p({class:e.cx("headerActions")},e.ptm("headerActions")),[e.maximizable?C(e.$slots,"maximizebutton",{key:0,maximized:d.maximized,maximizeCallback:function(k){return r.maximize(k)}},function(){return[m(D,p({ref:r.maximizableRef,autofocus:d.focusableMax,class:e.cx("pcMaximizeButton"),onClick:r.maximize,tabindex:e.maximizable?"0":"-1",unstyled:e.unstyled},e.maximizeButtonProps,{pt:e.ptm("pcMaximizeButton"),"data-pc-group-section":"headericon"}),{icon:h(function(b){return[C(e.$slots,"maximizeicon",{maximized:d.maximized},function(){return[(l(),x(V(r.maximizeIconComponent),p({class:[b.class,d.maximized?e.minimizeIcon:e.maximizeIcon]},e.ptm("pcMaximizeButton").icon),null,16,["class"]))]})]}),_:3},16,["autofocus","class","onClick","tabindex","unstyled","pt"])]}):y("",!0),e.closable?C(e.$slots,"closebutton",{key:1,closeCallback:r.close},function(){return[m(D,p({ref:r.closeButtonRef,autofocus:d.focusableClose,class:e.cx("pcCloseButton"),onClick:r.close,"aria-label":r.closeAriaLabel,unstyled:e.unstyled},e.closeButtonProps,{pt:e.ptm("pcCloseButton"),"data-pc-group-section":"headericon"}),{icon:h(function(b){return[C(e.$slots,"closeicon",{},function(){return[(l(),x(V(e.closeIcon?"span":"TimesIcon"),p({class:[e.closeIcon,b.class]},e.ptm("pcCloseButton").icon),null,16,["class"]))]})]}),_:3},16,["autofocus","class","onClick","aria-label","unstyled","pt"])]}):y("",!0)],16)],16)):y("",!0),i("div",p({ref:r.contentRef,class:[e.cx("content"),e.contentClass],style:e.contentStyle,"data-p":r.dataP},G(G({},e.contentProps),e.ptm("content"))),[C(e.$slots,"default")],16,ct),e.footer||e.$slots.footer?(l(),f("div",p({key:1,ref:r.footerContainerRef,class:e.cx("footer")},e.ptm("footer")),[C(e.$slots,"footer",{},function(){return[w(g(e.footer),1)]})],16)):y("",!0)],64))],16,dt)),[[v,{disabled:!e.modal}]]):y("",!0)]}),_:3},16,["onEnter","onAfterEnter","onBeforeLeave","onLeave","onAfterLeave"])],16,lt)):y("",!0)]}),_:3},8,["appendTo"])}re.render=pt;const mt={class:"min-h-screen bg-gray-50 p-4 sm:p-6"},ft={class:"max-w-7xl mx-auto"},gt={class:"flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"},yt={class:"flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"},bt={key:0,class:"flex justify-center items-center py-20"},ht={key:3,class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"},vt={class:"p-4 bg-gray-900 text-white rounded-t-lg"},Ct={class:"flex justify-between items-start"},wt={class:"text-xl font-bold"},kt={class:"space-y-3"},xt={class:"flex justify-between items-center py-2 border-b border-gray-200"},Dt={class:"font-semibold text-gray-900"},zt={class:"flex justify-between items-center py-2 border-b border-gray-200"},Lt={class:"font-semibold text-gray-900"},St={class:"flex justify-between items-center py-2 border-b border-gray-200"},Et={class:"flex justify-between items-center py-2 border-b border-gray-200"},Bt={class:"font-semibold text-gray-900 text-sm"},$t={class:"flex justify-between items-center py-2"},At={class:"text-sm text-gray-500"},Mt={class:"flex gap-2"},It={key:0,class:"space-y-6"},Pt={class:"space-y-2"},jt={class:"space-y-2"},Ot={key:0},Nt={__name:"Dashboard",setup(e){const t=S([]),n=S(null),a=S(!1),d=S(!0),r=S(""),D=async()=>{try{const{data:{user:s}}=await I.auth.getUser();if(!s){r.value="Utilisateur non authentifié";return}const{data:o,error:M}=await I.from("campaigns").select("*").eq("user_id",s.id).order("created_at",{ascending:!1});if(M)throw M;t.value=o||[]}catch(s){r.value=s.message||"Erreur lors du chargement des campagnes"}finally{d.value=!1}},z=s=>({pending:"En attente",running:"En cours",completed:"Terminée",stopped:"Arrêtée",error:"Erreur"})[s]||s,v=s=>({pending:"warning",running:"info",completed:"success",stopped:"secondary",error:"danger"})[s]||"secondary",b=s=>s||"N/A",k=s=>s?new Date(s).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}):"N/A",$=async s=>{try{const{data:o}=await I.from("campaign_results").select("*").eq("campaign_id",s.id).order("created_at",{ascending:!1});n.value={...s,results:o||[]},a.value=!0}catch{n.value=s,a.value=!0}},A=async s=>{if(confirm("Êtes-vous sûr de vouloir arrêter cette campagne ?"))try{const{error:o}=await I.from("campaigns").update({status:"stopped"}).eq("id",s);if(o)throw o;await D()}catch(o){r.value=o.message||"Erreur lors de l'arrêt de la campagne"}};return ve(()=>{D()}),(s,o)=>{const M=_("tooltip");return l(),f("div",mt,[i("div",ft,[m(c(j),{class:"mb-6 shadow-md border border-gray-200"},{content:h(()=>[i("div",gt,[o[4]||(o[4]=i("div",{class:"flex-1"},[i("h1",{class:"text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"}," Dashboard "),i("p",{class:"text-gray-600 text-base sm:text-lg"},"Gérez vos campagnes de prospection")],-1)),i("div",yt,[m(c(L),{label:"Techniques",icon:"pi pi-book",severity:"secondary",outlined:"",onClick:o[0]||(o[0]=u=>s.$router.push("/techniques")),class:"w-full sm:w-auto"}),m(c(L),{label:"Nouvelle Campagne",icon:"pi pi-plus",onClick:o[1]||(o[1]=u=>s.$router.push("/campaign")),class:"w-full sm:w-auto"})])])]),_:1}),d.value?(l(),f("div",bt,[m(c(ne))])):y("",!0),r.value?(l(),x(c(De),{key:1,severity:"error",closable:!1,class:"mb-6"},{default:h(()=>[w(g(r.value),1)]),_:1})):y("",!0),!d.value&&t.value.length===0?(l(),x(c(j),{key:2,class:"text-center py-12 shadow-md border border-gray-200"},{content:h(()=>[o[5]||(o[5]=i("i",{class:"pi pi-rocket text-6xl text-gray-700 mb-4"},null,-1)),o[6]||(o[6]=i("h2",{class:"text-2xl font-bold text-gray-900 mb-2"},"Commencez votre première campagne",-1)),o[7]||(o[7]=i("p",{class:"text-gray-600 mb-6"},"Créez une nouvelle campagne de prospection pour démarrer",-1)),m(c(L),{label:"Créer une Campagne",icon:"pi pi-plus-circle",onClick:o[2]||(o[2]=u=>s.$router.push("/campaign"))})]),_:1})):y("",!0),!d.value&&t.value.length>0?(l(),f("div",ht,[(l(!0),f(te,null,Ce(t.value,u=>(l(),x(c(j),{key:u.id,class:"hover:shadow-xl transition-all duration-300 hover:-translate-y-2"},{header:h(()=>[i("div",vt,[i("div",Ct,[i("h3",wt,g(u.company_name),1),m(c(R),{value:z(u.status),severity:v(u.status)},null,8,["value","severity"])])])]),content:h(()=>[i("div",kt,[i("div",xt,[o[8]||(o[8]=i("span",{class:"text-gray-600 font-medium"},"Secteur:",-1)),i("span",Dt,g(u.domain),1)]),i("div",zt,[o[9]||(o[9]=i("span",{class:"text-gray-600 font-medium"},"Agent:",-1)),i("span",Lt,g(u.agent_name),1)]),i("div",St,[o[10]||(o[10]=i("span",{class:"text-gray-600 font-medium"},"Contacts:",-1)),m(c(we),{value:u.contacts_count||0,severity:"info"},null,8,["value"])]),i("div",Et,[o[11]||(o[11]=i("span",{class:"text-gray-600 font-medium"},"Objectif:",-1)),i("span",Bt,g(b(u.objectifs)),1)]),i("div",$t,[o[12]||(o[12]=i("span",{class:"text-gray-600 font-medium"},"Créée le:",-1)),i("span",At,g(k(u.created_at)),1)])])]),footer:h(()=>[i("div",Mt,[m(c(L),{label:"Détails",icon:"pi pi-eye",severity:"secondary",outlined:"",onClick:ae=>$(u),class:"flex-1"},null,8,["onClick"]),u.status==="pending"||u.status==="running"?ee((l(),x(c(L),{key:0,icon:"pi pi-stop",severity:"danger",outlined:"",onClick:ae=>A(u.id)},null,8,["onClick"])),[[M,"Arrêter la campagne"]]):y("",!0)])]),_:2},1024))),128))])):y("",!0),m(c(re),{visible:a.value,"onUpdate:visible":o[3]||(o[3]=u=>a.value=u),header:n.value?`Détails: ${n.value.company_name}`:"",style:{width:"90vw",maxWidth:"800px"},modal:!0,closable:!0},{default:h(()=>[n.value?(l(),f("div",It,[i("div",null,[o[17]||(o[17]=i("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Informations Entreprise",-1)),i("div",Pt,[i("p",null,[o[13]||(o[13]=i("strong",null,"Nom:",-1)),w(" "+g(n.value.company_name),1)]),i("p",null,[o[14]||(o[14]=i("strong",null,"Secteur:",-1)),w(" "+g(n.value.domain),1)]),i("p",null,[o[15]||(o[15]=i("strong",null,"Promesse de valeur:",-1)),w(" "+g(n.value.value_proposition),1)]),i("p",null,[o[16]||(o[16]=i("strong",null,"Détails:",-1)),w(" "+g(n.value.infos),1)])])]),m(c(T)),i("div",null,[o[20]||(o[20]=i("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Configuration Agent",-1)),i("div",jt,[i("p",null,[o[18]||(o[18]=i("strong",null,"Nom:",-1)),w(" "+g(n.value.agent_name),1)]),i("p",null,[o[19]||(o[19]=i("strong",null,"Seuil de confiance:",-1)),w(" "+g(n.value.confidence_threshold),1)])])]),m(c(T)),i("div",null,[o[22]||(o[22]=i("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Objectifs",-1)),i("p",null,[o[21]||(o[21]=i("strong",null,"Type:",-1)),w(" "+g(b(n.value.objectifs)),1)])]),n.value.results&&n.value.results.length>0?(l(),f("div",Ot,[m(c(T)),o[23]||(o[23]=i("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Résultats de Prospection",-1)),m(c(Le),{value:n.value.results,paginator:!0,rows:5,class:"p-datatable-sm"},{default:h(()=>[m(c(O),{field:"contact_name",header:"Contact"}),m(c(O),{field:"status",header:"Statut"},{body:h(u=>[m(c(R),{value:u.data.status,severity:v(u.data.status)},null,8,["value","severity"])]),_:1}),m(c(O),{field:"notes",header:"Notes"})]),_:1},8,["value"])])):y("",!0)])):y("",!0)]),_:1},8,["visible","header"])])])}}};export{Nt as default};
