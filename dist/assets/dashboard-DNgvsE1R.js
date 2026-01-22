import{s as V,a as Q,b as g,c as X,d as z}from"./campaign-NSLlLKO8.js";import{B as M,j as W,t as te,f as p,o as d,y as P,k as v,l as ne,m as k,D as le,g as n,a8 as u,r as b,aJ as de,aK as ue,O as l,z as c,u as o,aj as _,a7 as y,M as Y,N as Z,aL as ee,x as pe,A as ce,al as ve}from"./primevue-C2k2LWtI.js";var ye=`
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
`,ge={root:function(a){var r=a.props;return["p-tag p-component",{"p-tag-info":r.severity==="info","p-tag-success":r.severity==="success","p-tag-warn":r.severity==="warn","p-tag-danger":r.severity==="danger","p-tag-secondary":r.severity==="secondary","p-tag-contrast":r.severity==="contrast","p-tag-rounded":r.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},me=M.extend({name:"tag",style:ye,classes:ge}),fe={name:"BaseTag",extends:W,props:{value:null,severity:null,rounded:Boolean,icon:String},style:me,provide:function(){return{$pcTag:this,$parentInstance:this}}};function A(t){"@babel/helpers - typeof";return A=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},A(t)}function be(t,a,r){return(a=he(a))in t?Object.defineProperty(t,a,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[a]=r,t}function he(t){var a=_e(t,"string");return A(a)=="symbol"?a:a+""}function _e(t,a){if(A(t)!="object"||!t)return t;var r=t[Symbol.toPrimitive];if(r!==void 0){var m=r.call(t,a);if(A(m)!="object")return m;throw new TypeError("@@toPrimitive must return a primitive value.")}return(a==="string"?String:Number)(t)}var N={name:"Tag",extends:fe,inheritAttrs:!1,computed:{dataP:function(){return te(be({rounded:this.rounded},this.severity,this.severity))}}},xe=["data-p"];function we(t,a,r,m,x,h){return d(),p("span",k({class:t.cx("root"),"data-p":h.dataP},t.ptmi("root")),[t.$slots.icon?(d(),P(le(t.$slots.icon),k({key:0,class:t.cx("icon")},t.ptm("icon")),null,16,["class"])):t.icon?(d(),p("span",k({key:1,class:[t.cx("icon"),t.icon]},t.ptm("icon")),null,16)):v("",!0),t.value!=null||t.$slots.default?ne(t.$slots,"default",{key:2},function(){return[n("span",k({class:t.cx("label")},t.ptm("label")),u(t.value),17)]}):v("",!0)],16,xe)}N.render=we;var ke=`
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
`,$e={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},Se=M.extend({name:"progressspinner",style:ke,classes:$e}),Ce={name:"BaseProgressSpinner",extends:W,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:Se,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},re={name:"ProgressSpinner",extends:Ce,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},De=["fill","stroke-width"];function je(t,a,r,m,x,h){return d(),p("div",k({class:t.cx("root"),role:"progressbar"},t.ptmi("root")),[(d(),p("svg",k({class:t.cx("spin"),viewBox:"25 25 50 50",style:h.svgStyle},t.ptm("spin")),[n("circle",k({class:t.cx("circle"),cx:"50",cy:"50",r:"20",fill:t.fill,"stroke-width":t.strokeWidth,strokeMiterlimit:"10"},t.ptm("circle")),null,16,De)],16))],16)}re.render=je;var ze=`
    .p-divider-horizontal {
        display: flex;
        width: 100%;
        position: relative;
        align-items: center;
        margin: dt('divider.horizontal.margin');
        padding: dt('divider.horizontal.padding');
    }

    .p-divider-horizontal:before {
        position: absolute;
        display: block;
        inset-block-start: 50%;
        inset-inline-start: 0;
        width: 100%;
        content: '';
        border-block-start: 1px solid dt('divider.border.color');
    }

    .p-divider-horizontal .p-divider-content {
        padding: dt('divider.horizontal.content.padding');
    }

    .p-divider-vertical {
        min-height: 100%;
        display: flex;
        position: relative;
        justify-content: center;
        margin: dt('divider.vertical.margin');
        padding: dt('divider.vertical.padding');
    }

    .p-divider-vertical:before {
        position: absolute;
        display: block;
        inset-block-start: 0;
        inset-inline-start: 50%;
        height: 100%;
        content: '';
        border-inline-start: 1px solid dt('divider.border.color');
    }

    .p-divider.p-divider-vertical .p-divider-content {
        padding: dt('divider.vertical.content.padding');
    }

    .p-divider-content {
        z-index: 1;
        background: dt('divider.content.background');
        color: dt('divider.content.color');
    }

    .p-divider-solid.p-divider-horizontal:before {
        border-block-start-style: solid;
    }

    .p-divider-solid.p-divider-vertical:before {
        border-inline-start-style: solid;
    }

    .p-divider-dashed.p-divider-horizontal:before {
        border-block-start-style: dashed;
    }

    .p-divider-dashed.p-divider-vertical:before {
        border-inline-start-style: dashed;
    }

    .p-divider-dotted.p-divider-horizontal:before {
        border-block-start-style: dotted;
    }

    .p-divider-dotted.p-divider-vertical:before {
        border-inline-start-style: dotted;
    }

    .p-divider-left:dir(rtl),
    .p-divider-right:dir(rtl) {
        flex-direction: row-reverse;
    }
`,Pe={root:function(a){var r=a.props;return{justifyContent:r.layout==="horizontal"?r.align==="center"||r.align===null?"center":r.align==="left"?"flex-start":r.align==="right"?"flex-end":null:null,alignItems:r.layout==="vertical"?r.align==="center"||r.align===null?"center":r.align==="top"?"flex-start":r.align==="bottom"?"flex-end":null:null}}},Ne={root:function(a){var r=a.props;return["p-divider p-component","p-divider-"+r.layout,"p-divider-"+r.type,{"p-divider-left":r.layout==="horizontal"&&(!r.align||r.align==="left")},{"p-divider-center":r.layout==="horizontal"&&r.align==="center"},{"p-divider-right":r.layout==="horizontal"&&r.align==="right"},{"p-divider-top":r.layout==="vertical"&&r.align==="top"},{"p-divider-center":r.layout==="vertical"&&(!r.align||r.align==="center")},{"p-divider-bottom":r.layout==="vertical"&&r.align==="bottom"}]},content:"p-divider-content"},Ae=M.extend({name:"divider",style:ze,classes:Ne,inlineStyles:Pe}),Ee={name:"BaseDivider",extends:W,props:{align:{type:String,default:null},layout:{type:String,default:"horizontal"},type:{type:String,default:"solid"}},style:Ae,provide:function(){return{$pcDivider:this,$parentInstance:this}}};function E(t){"@babel/helpers - typeof";return E=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},E(t)}function q(t,a,r){return(a=Oe(a))in t?Object.defineProperty(t,a,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[a]=r,t}function Oe(t){var a=Re(t,"string");return E(a)=="symbol"?a:a+""}function Re(t,a){if(E(t)!="object"||!t)return t;var r=t[Symbol.toPrimitive];if(r!==void 0){var m=r.call(t,a);if(E(m)!="object")return m;throw new TypeError("@@toPrimitive must return a primitive value.")}return(a==="string"?String:Number)(t)}var S={name:"Divider",extends:Ee,inheritAttrs:!1,computed:{dataP:function(){return te(q(q(q({},this.align,this.align),this.layout,this.layout),this.type,this.type))}}},Te=["aria-orientation","data-p"],Be=["data-p"];function Je(t,a,r,m,x,h){return d(),p("div",k({class:t.cx("root"),style:t.sx("root"),role:"separator","aria-orientation":t.layout,"data-p":h.dataP},t.ptmi("root")),[t.$slots.default?(d(),p("div",k({key:0,class:t.cx("content"),"data-p":h.dataP},t.ptm("content")),[ne(t.$slots,"default")],16,Be)):v("",!0)],16,Te)}S.render=Je;const Le={class:"min-h-screen bg-gray-50 p-4 sm:p-6"},Ie={class:"max-w-7xl mx-auto"},Ue={class:"flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"},Ve={class:"flex-1"},qe={key:0,class:"mt-3 flex items-center gap-3"},Me={class:"text-sm text-gray-600"},We={key:0},Fe={key:1},Ke={class:"flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"},Ge={key:0,class:"flex justify-center items-center py-20"},He={key:3},Qe={class:"flex justify-end mb-4"},Xe={class:"flex gap-2"},Ye={key:0,class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"},Ze={class:"p-4 bg-gray-900 text-white rounded-t-lg"},et={class:"flex justify-between items-start"},tt={class:"text-xl font-bold text-white"},nt={class:"space-y-3"},rt={class:"flex justify-between items-center py-2 border-b border-gray-200"},st={class:"font-semibold text-gray-900"},at={class:"flex justify-between items-center py-2 border-b border-gray-200"},it={class:"font-semibold text-gray-900"},ot={class:"flex justify-between items-center py-2 border-b border-gray-200"},lt={class:"flex justify-between items-center py-2 border-b border-gray-200"},dt={class:"font-semibold text-gray-900 text-sm"},ut={class:"flex justify-between items-center py-2"},pt={class:"text-sm text-gray-500"},ct={class:"flex gap-2"},vt={key:1},yt={class:"flex gap-2"},gt={key:0,class:"space-y-6"},mt={class:"space-y-2"},ft={class:"space-y-2"},bt={key:0},ht={key:0},_t={class:"flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"},xt={class:"flex-1"},wt={key:0,class:"mt-3 p-2 bg-blue-50 rounded text-sm"},kt={class:"flex items-center gap-2 flex-wrap lg:flex-nowrap"},$t={key:0,class:"mb-2"},St={key:1},Ct={class:"space-y-3 max-h-64 overflow-auto p-3 bg-gray-50 rounded border text-sm"},Dt={class:"font-semibold text-gray-900 mb-1"},jt={key:0,class:"text-xs text-gray-500 font-normal"},zt={class:"text-gray-700 whitespace-pre-wrap"},Pt={key:2,class:"text-sm text-gray-600"},Nt={key:0},At={class:"whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm overflow-auto",style:{"max-height":"50vh"}},Et={__name:"Dashboard",setup(t){const a=b([]),r=b(null),m=b(!1),x=b(window.innerWidth<768?"list":"grid"),h=b(!0),C=b(""),$=b(null),T=b(!1),w=b(null),O=b(!0),D=b([]),B=b(!1);let R=null;const J=async()=>{try{const{data:{user:i}}=await z.auth.getUser();if(!i){C.value="Utilisateur non authentifié";return}const{data:e,error:f}=await z.from("campaigns").select("*").eq("user_id",i.id).order("created_at",{ascending:!1});if(f)throw f;a.value=e||[]}catch(i){C.value=i.message||"Erreur lors du chargement des campagnes"}finally{h.value=!1}},F=i=>({pending:"En attente",running:"En cours",completed:"Terminée",stopped:"Arrêtée",error:"Erreur"})[i]||i,L=i=>({pending:"warning",running:"info",completed:"success",stopped:"secondary",error:"danger"})[i]||"secondary",K=i=>i||"N/A",I=i=>i?new Date(i).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}):"N/A",se=i=>{if(!i)return"N/A";try{const e=Number(i);return Number.isNaN(e)?String(i):new Date(e).toLocaleString("fr-FR",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return String(i)}},G=async i=>{try{const{data:e}=await z.from("campaign_results").select("*").eq("campaign_id",i.id).order("created_at",{ascending:!1});r.value={...i,results:e||[]},m.value=!0}catch{r.value=i,m.value=!0}},ae=i=>{w.value=i;try{const e=i.raw_payload||{},f=[];if(e.call_analysis&&Array.isArray(e.call_analysis.turns)&&e.call_analysis.turns.length)for(const s of e.call_analysis.turns)f.push({speaker:s.speaker||s.role||"Speaker",text:s.text||s.transcript||"",time:s.start_ts||null});else if(e.call_analysis&&Array.isArray(e.call_analysis.segments)&&e.call_analysis.segments.length)for(const s of e.call_analysis.segments)f.push({speaker:s.speaker||s.role||"Speaker",text:s.text||s.transcript||"",time:s.start_ts||null});else e.transcript&&typeof e.transcript=="string"?f.push({speaker:"Transcription",text:e.transcript}):e.call_analysis&&e.call_analysis.call_summary&&f.push({speaker:"Résumé",text:e.call_analysis.call_summary});D.value=f,B.value=!!(e.call_analysis&&e.call_analysis.transcription_error||!e.transcript&&!(e.call_analysis&&(e.call_analysis.turns||e.call_analysis.segments||e.call_analysis.call_summary)))}catch{D.value=[],B.value=!1}T.value=!0},ie=async()=>{try{const i=H(w.value?.raw_payload);await navigator.clipboard.writeText(i),alert("JSON copié dans le presse-papiers")}catch(i){alert("Impossible de copier le JSON: "+(i?.message||i))}},U=async()=>{try{const{data:{user:i}}=await z.auth.getUser();if(!i)return;const e=await fetch(`/api/user-plan?user_id=${i.id}`);if(!e.ok)return;const f=await e.json();$.value=f.plan||null}catch{}},oe=async i=>{if(confirm("Êtes-vous sûr de vouloir arrêter cette campagne ?"))try{const{error:e}=await z.from("campaigns").update({status:"stopped"}).eq("id",i);if(e)throw e;await J()}catch(e){C.value=e.message||"Erreur lors de l'arrêt de la campagne"}};de(()=>{J(),U(),window.addEventListener("plan:updated",U),R=setInterval(()=>{J()},5e3);const i=()=>{x.value=window.innerWidth<768?"list":"grid"};return window.addEventListener("resize",i),()=>{window.removeEventListener("resize",i)}}),ue(()=>{window.removeEventListener("plan:updated",U),R&&(clearInterval(R),R=null)});const H=i=>{try{return JSON.stringify(i,null,2)}catch{return String(i)}};return(i,e)=>{const f=pe("tooltip");return d(),p("div",Le,[n("div",Ie,[l(o(V),{class:"mb-6 shadow-md border border-gray-200"},{content:c(()=>[n("div",Ue,[n("div",Ve,[e[8]||(e[8]=n("h1",{class:"text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"}," Dashboard ",-1)),e[9]||(e[9]=n("p",{class:"text-gray-600 text-base sm:text-lg"},"Gérez vos campagnes de prospection",-1)),$.value?(d(),p("div",qe,[l(o(N),{value:$.value.plan_slug||$.value.name||"Plan actif",severity:"info"},null,8,["value"]),n("div",Me,[$.value.included_minutes?(d(),p("div",We,"Inclus: "+u($.value.included_minutes)+" min",1)):v("",!0),$.value.expires_at?(d(),p("div",Fe,"Expire: "+u(I($.value.expires_at)),1)):v("",!0)])])):v("",!0)]),n("div",Ke,[l(o(_),{label:"Techniques",icon:"pi pi-book",severity:"secondary",outlined:"",onClick:e[0]||(e[0]=s=>i.$router.push("/techniques")),class:"w-full sm:w-auto"}),l(o(_),{label:"Nouvelle Campagne",icon:"pi pi-plus",onClick:e[1]||(e[1]=s=>i.$router.push("/campaign")),class:"w-full sm:w-auto"})])])]),_:1}),h.value?(d(),p("div",Ge,[l(o(re))])):v("",!0),C.value?(d(),P(o(Q),{key:1,severity:"error",closable:!1,class:"mb-6"},{default:c(()=>[y(u(C.value),1)]),_:1})):v("",!0),!h.value&&a.value.length===0?(d(),P(o(V),{key:2,class:"text-center py-12 shadow-md border border-gray-200"},{content:c(()=>[e[10]||(e[10]=n("i",{class:"pi pi-rocket text-6xl text-gray-700 mb-4"},null,-1)),e[11]||(e[11]=n("h2",{class:"text-2xl font-bold text-gray-900 mb-2"},"Commencez votre première campagne",-1)),e[12]||(e[12]=n("p",{class:"text-gray-600 mb-6"},"Créez une nouvelle campagne de prospection pour démarrer",-1)),l(o(_),{label:"Créer une Campagne",icon:"pi pi-plus-circle",onClick:e[2]||(e[2]=s=>i.$router.push("/campaign"))})]),_:1})):v("",!0),!h.value&&a.value.length>0?(d(),p("div",He,[n("div",Qe,[n("div",Xe,[l(o(_),{severity:x.value==="grid"?"primary":"secondary",label:"Cartes",icon:"pi pi-th-large",onClick:e[3]||(e[3]=s=>x.value="grid")},null,8,["severity"]),l(o(_),{severity:x.value==="list"?"primary":"secondary",label:"Liste",icon:"pi pi-list",onClick:e[4]||(e[4]=s=>x.value="list")},null,8,["severity"])])]),x.value==="grid"?(d(),p("div",Ye,[(d(!0),p(Y,null,Z(a.value,s=>(d(),P(o(V),{key:s.id,class:"hover:shadow-xl transition-all duration-300 hover:-translate-y-2"},{header:c(()=>[n("div",Ze,[n("div",et,[n("h3",tt,u(s.company_name),1),l(o(N),{value:F(s.status),severity:L(s.status)},null,8,["value","severity"])])])]),content:c(()=>[n("div",nt,[n("div",rt,[e[13]||(e[13]=n("span",{class:"text-gray-600 font-medium"},"Secteur:",-1)),n("span",st,u(s.domain),1)]),n("div",at,[e[14]||(e[14]=n("span",{class:"text-gray-600 font-medium"},"Agent:",-1)),n("span",it,u(s.agent_name),1)]),n("div",ot,[e[15]||(e[15]=n("span",{class:"text-gray-600 font-medium"},"Contacts:",-1)),l(o(ve),{value:s.contacts_count||0,severity:"info"},null,8,["value"])]),n("div",lt,[e[16]||(e[16]=n("span",{class:"text-gray-600 font-medium"},"Objectif:",-1)),n("span",dt,u(K(s.objectifs)),1)]),n("div",ut,[e[17]||(e[17]=n("span",{class:"text-gray-600 font-medium"},"Créée le:",-1)),n("span",pt,u(I(s.created_at)),1)])])]),footer:c(()=>[n("div",ct,[l(o(_),{label:"Détails",icon:"pi pi-eye",severity:"secondary",outlined:"",onClick:j=>G(s),class:"flex-1"},null,8,["onClick"]),s.status==="pending"||s.status==="running"?ce((d(),P(o(_),{key:0,icon:"pi pi-stop",severity:"danger",outlined:"",onClick:j=>oe(s.id)},null,8,["onClick"])),[[f,"Arrêter la campagne"]]):v("",!0)])]),_:2},1024))),128))])):v("",!0),x.value==="list"?(d(),p("div",vt,[l(o(X),{value:a.value,responsiveLayout:"scroll"},{default:c(()=>[l(o(g),{field:"company_name",header:"Entreprise"}),l(o(g),{field:"domain",header:"Secteur"}),l(o(g),{field:"agent_name",header:"Agent"}),l(o(g),{field:"contacts_count",header:"Contacts"}),l(o(g),{field:"status",header:"Statut"},{body:c(s=>[l(o(N),{value:F(s.data.status),severity:L(s.data.status)},null,8,["value","severity"])]),_:1}),l(o(g),{field:"created_at",header:"Créée le"},{body:c(s=>[y(u(I(s.data.created_at)),1)]),_:1}),l(o(g),{header:"Actions"},{body:c(s=>[n("div",yt,[l(o(_),{label:"Détails",icon:"pi pi-eye",class:"p-button-sm",onClick:j=>G(s.data)},null,8,["onClick"])])]),_:1})]),_:1},8,["value"])])):v("",!0)])):v("",!0),l(o(ee),{visible:m.value,"onUpdate:visible":e[5]||(e[5]=s=>m.value=s),header:r.value?`Détails: ${r.value.company_name}`:"",style:{width:"90vw",maxWidth:"800px"},modal:!0,closable:!0},{default:c(()=>[r.value?(d(),p("div",gt,[n("div",null,[e[22]||(e[22]=n("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Informations Entreprise",-1)),n("div",mt,[n("p",null,[e[18]||(e[18]=n("strong",null,"Nom:",-1)),y(" "+u(r.value.company_name),1)]),n("p",null,[e[19]||(e[19]=n("strong",null,"Secteur:",-1)),y(" "+u(r.value.domain),1)]),n("p",null,[e[20]||(e[20]=n("strong",null,"Promesse de valeur:",-1)),y(" "+u(r.value.value_proposition),1)]),n("p",null,[e[21]||(e[21]=n("strong",null,"Détails:",-1)),y(" "+u(r.value.infos),1)])])]),l(o(S)),n("div",null,[e[25]||(e[25]=n("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Configuration Agent",-1)),n("div",ft,[n("p",null,[e[23]||(e[23]=n("strong",null,"Nom:",-1)),y(" "+u(r.value.agent_name),1)]),n("p",null,[e[24]||(e[24]=n("strong",null,"Seuil de confiance:",-1)),y(" "+u(r.value.confidence_threshold),1)])])]),l(o(S)),n("div",null,[e[27]||(e[27]=n("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Objectifs",-1)),n("p",null,[e[26]||(e[26]=n("strong",null,"Type:",-1)),y(" "+u(K(r.value.objectifs)),1)])]),r.value.results&&r.value.results.length>0?(d(),p("div",bt,[l(o(S)),e[28]||(e[28]=n("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Résultats de Prospection",-1)),l(o(X),{value:r.value.results,paginator:!0,rows:5,class:"p-datatable-sm"},{default:c(()=>[l(o(g),{field:"call_id",header:"Call ID"},{body:c(s=>[y(u(s.data.call_id||s.data.raw_payload?.call_id||"-"),1)]),_:1}),l(o(g),{field:"to",header:"Vers"},{body:c(s=>[y(u(s.data.contact_phone||s.data.raw_payload?.to_number||"-"),1)]),_:1}),l(o(g),{field:"from",header:"Depuis"},{body:c(s=>[y(u(s.data.raw_payload?.from_number||"-"),1)]),_:1}),l(o(g),{field:"start",header:"Début"},{body:c(s=>[y(u(se(s.data.raw_payload?.start_timestamp)),1)]),_:1}),l(o(g),{field:"status",header:"Statut"},{body:c(s=>[l(o(N),{value:s.data.status,severity:L(s.data.status)},null,8,["value","severity"])]),_:1}),l(o(g),{field:"summary",header:"Résumé"},{body:c(s=>[y(u(s.data.raw_payload?.call_analysis?.call_summary||s.data.notes||"-"),1)]),_:1}),l(o(g),{header:"Raw"},{body:c(s=>[l(o(_),{label:"Voir",class:"p-button-sm",onClick:j=>ae(s.data)},null,8,["onClick"])]),_:1})]),_:1},8,["value"])])):v("",!0)])):v("",!0)]),_:1},8,["visible","header"]),l(o(ee),{visible:T.value,"onUpdate:visible":e[7]||(e[7]=s=>T.value=s),header:"Payload brut",style:{width:"90vw",maxWidth:"900px"},modal:!0},{default:c(()=>[w.value?(d(),p("div",ht,[n("div",_t,[n("div",xt,[e[33]||(e[33]=n("h4",{class:"font-semibold mb-2"},"Résumé",-1)),n("p",null,[e[29]||(e[29]=n("strong",null,"Contact:",-1)),y(" "+u(w.value.contact_name||w.value.contact_phone),1)]),n("p",null,[e[30]||(e[30]=n("strong",null,"Statut:",-1)),y(" "+u(w.value.status),1)]),n("p",null,[e[31]||(e[31]=n("strong",null,"Durée:",-1)),y(" "+u(w.value.call_duration)+"s",1)]),w.value.raw_payload?.call_analysis?.call_summary?(d(),p("p",wt,[e[32]||(e[32]=n("strong",null,"Résumé de l'appel:",-1)),y(" "+u(w.value.raw_payload.call_analysis.call_summary),1)])):v("",!0)]),n("div",kt,[l(o(_),{label:"Copier JSON",icon:"pi pi-copy",class:"p-button-sm",onClick:ie}),l(o(_),{label:O.value?"Masquer JSON":"Afficher JSON",class:"p-button-sm",onClick:e[6]||(e[6]=s=>O.value=!O.value)},null,8,["label"])])]),l(o(S)),n("div",null,[e[34]||(e[34]=n("h4",{class:"font-semibold mb-2"},"Conversation",-1)),B.value?(d(),p("div",$t,[l(o(Q),{severity:"warn",text:"Problème détecté lors de la transcription — le rendu peut être incomplet."})])):v("",!0),D.value&&D.value.length?(d(),p("div",St,[n("div",Ct,[(d(!0),p(Y,null,Z(D.value,(s,j)=>(d(),p("div",{key:j,class:"pb-3 border-b last:border-b-0"},[n("div",Dt,[y(u(s.speaker)+" ",1),s.time?(d(),p("span",jt,"("+u(s.time)+")",1)):v("",!0)]),n("div",zt,u(s.text),1)]))),128))])])):(d(),p("div",Pt,"Aucun contenu conversationnel détecté. Voir le JSON brut pour plus de détails."))]),l(o(S)),O.value?(d(),p("div",Nt,[e[35]||(e[35]=n("h4",{class:"font-semibold mb-2"},"Payload JSON",-1)),n("pre",At,u(H(w.value.raw_payload)),1)])):v("",!0)])):v("",!0)]),_:1},8,["visible"])])])}}},Tt=Object.freeze(Object.defineProperty({__proto__:null,default:Et},Symbol.toStringTag,{value:"Module"}));export{Tt as D,re as a,N as b,S as s};
