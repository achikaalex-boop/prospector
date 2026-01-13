import{B as Q,s as X,f as ne,c,o as u,a as P,b as y,r as re,m as S,d as ae,e as t,t as d,g as f,h as oe,i as le,j as o,w as p,u as r,k as b,l as g,F as M,n as W,p as G,q as j,v as ie,x as de,y as ue}from"./index-Dh6sIx4Y.js";import{s as L}from"./index-CZ4CAEJ2.js";import{s as K}from"./index-Cas_ztGz.js";import{s as A}from"./index-UXPQAKnE.js";import{s as v,a as H}from"./index-WAQcJUEV.js";import"./index-DSWzrQQG.js";var ce=`
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
`,pe={root:function(i){var l=i.props;return["p-tag p-component",{"p-tag-info":l.severity==="info","p-tag-success":l.severity==="success","p-tag-warn":l.severity==="warn","p-tag-danger":l.severity==="danger","p-tag-secondary":l.severity==="secondary","p-tag-contrast":l.severity==="contrast","p-tag-rounded":l.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},ge=Q.extend({name:"tag",style:ce,classes:pe}),ye={name:"BaseTag",extends:X,props:{value:null,severity:null,rounded:Boolean,icon:String},style:ge,provide:function(){return{$pcTag:this,$parentInstance:this}}};function E(n){"@babel/helpers - typeof";return E=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(i){return typeof i}:function(i){return i&&typeof Symbol=="function"&&i.constructor===Symbol&&i!==Symbol.prototype?"symbol":typeof i},E(n)}function ve(n,i,l){return(i=me(i))in n?Object.defineProperty(n,i,{value:l,enumerable:!0,configurable:!0,writable:!0}):n[i]=l,n}function me(n){var i=fe(n,"string");return E(i)=="symbol"?i:i+""}function fe(n,i){if(E(n)!="object"||!n)return n;var l=n[Symbol.toPrimitive];if(l!==void 0){var h=l.call(n,i);if(E(h)!="object")return h;throw new TypeError("@@toPrimitive must return a primitive value.")}return(i==="string"?String:Number)(n)}var $={name:"Tag",extends:ye,inheritAttrs:!1,computed:{dataP:function(){return ne(ve({rounded:this.rounded},this.severity,this.severity))}}},be=["data-p"];function he(n,i,l,h,_,x){return u(),c("span",S({class:n.cx("root"),"data-p":x.dataP},n.ptmi("root")),[n.$slots.icon?(u(),P(ae(n.$slots.icon),S({key:0,class:n.cx("icon")},n.ptm("icon")),null,16,["class"])):n.icon?(u(),c("span",S({key:1,class:[n.cx("icon"),n.icon]},n.ptm("icon")),null,16)):y("",!0),n.value!=null||n.$slots.default?re(n.$slots,"default",{key:2},function(){return[t("span",S({class:n.cx("label")},n.ptm("label")),d(n.value),17)]}):y("",!0)],16,be)}$.render=he;var _e=`
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
`,xe={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},we=Q.extend({name:"progressspinner",style:_e,classes:xe}),ke={name:"BaseProgressSpinner",extends:X,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:we,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},Y={name:"ProgressSpinner",extends:ke,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},Se=["fill","stroke-width"];function $e(n,i,l,h,_,x){return u(),c("div",S({class:n.cx("root"),role:"progressbar"},n.ptmi("root")),[(u(),c("svg",S({class:n.cx("spin"),viewBox:"25 25 50 50",style:x.svgStyle},n.ptm("spin")),[t("circle",S({class:n.cx("circle"),cx:"50",cy:"50",r:"20",fill:n.fill,"stroke-width":n.strokeWidth,strokeMiterlimit:"10"},n.ptm("circle")),null,16,Se)],16))],16)}Y.render=$e;const Ce={class:"min-h-screen bg-gray-50 p-4 sm:p-6"},De={class:"max-w-7xl mx-auto"},Ne={class:"flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"},je={class:"flex-1"},Ae={key:0,class:"mt-3 flex items-center gap-3"},Pe={class:"text-sm text-gray-600"},Ee={key:0},Re={key:1},Oe={class:"flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"},Te={key:0,class:"flex justify-center items-center py-20"},Be={key:3},Je={class:"flex justify-end mb-4"},ze={class:"flex gap-2"},Le={key:0,class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"},qe={class:"p-4 bg-gray-900 text-white rounded-t-lg"},Ue={class:"flex justify-between items-start"},Ve={class:"text-xl font-bold text-white"},Ie={class:"space-y-3"},Fe={class:"flex justify-between items-center py-2 border-b border-gray-200"},Me={class:"font-semibold text-gray-900"},We={class:"flex justify-between items-center py-2 border-b border-gray-200"},Ge={class:"font-semibold text-gray-900"},Ke={class:"flex justify-between items-center py-2 border-b border-gray-200"},He={class:"flex justify-between items-center py-2 border-b border-gray-200"},Qe={class:"font-semibold text-gray-900 text-sm"},Xe={class:"flex justify-between items-center py-2"},Ye={class:"text-sm text-gray-500"},Ze={class:"flex gap-2"},et={key:1},tt={class:"flex gap-2"},st={key:0,class:"space-y-6"},nt={class:"space-y-2"},rt={class:"space-y-2"},at={key:0},ot={key:0},lt={class:"flex items-start justify-between gap-4"},it={class:"flex items-center gap-2"},dt={key:0,class:"mb-2"},ut={key:1},ct={class:"space-y-3 max-h-64 overflow-auto p-2 bg-white rounded border"},pt={class:"flex items-center gap-2 mb-1"},gt={class:"text-sm text-gray-600"},yt={class:"text-sm text-gray-800"},vt={key:2,class:"text-sm text-gray-600"},mt={key:0},ft={class:"whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm overflow-auto",style:{"max-height":"50vh"}},St={__name:"Dashboard",setup(n){const i=f([]),l=f(null),h=f(!1),_=f("grid"),x=f(!0),C=f(""),w=f(null),O=f(!1),k=f(null),R=f(!0),D=f([]),T=f(!1),q=async()=>{try{const{data:{user:a}}=await j.auth.getUser();if(!a){C.value="Utilisateur non authentifié";return}const{data:e,error:m}=await j.from("campaigns").select("*").eq("user_id",a.id).order("created_at",{ascending:!1});if(m)throw m;i.value=e||[]}catch(a){C.value=a.message||"Erreur lors du chargement des campagnes"}finally{x.value=!1}},U=a=>({pending:"En attente",running:"En cours",completed:"Terminée",stopped:"Arrêtée",error:"Erreur"})[a]||a,B=a=>({pending:"warning",running:"info",completed:"success",stopped:"secondary",error:"danger"})[a]||"secondary",V=a=>a||"N/A",J=a=>a?new Date(a).toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}):"N/A",Z=a=>{if(!a)return"N/A";try{const e=Number(a);return Number.isNaN(e)?String(a):new Date(e).toLocaleString("fr-FR",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return String(a)}},I=async a=>{try{const{data:e}=await j.from("campaign_results").select("*").eq("campaign_id",a.id).order("created_at",{ascending:!1});l.value={...a,results:e||[]},h.value=!0}catch{l.value=a,h.value=!0}},ee=a=>{k.value=a;try{const e=a.raw_payload||{},m=[];if(e.call_analysis&&Array.isArray(e.call_analysis.turns)&&e.call_analysis.turns.length)for(const s of e.call_analysis.turns)m.push({speaker:s.speaker||s.role||"Speaker",text:s.text||s.transcript||"",time:s.start_ts||null});else if(e.call_analysis&&Array.isArray(e.call_analysis.segments)&&e.call_analysis.segments.length)for(const s of e.call_analysis.segments)m.push({speaker:s.speaker||s.role||"Speaker",text:s.text||s.transcript||"",time:s.start_ts||null});else e.transcript&&typeof e.transcript=="string"?m.push({speaker:"Transcription",text:e.transcript}):e.call_analysis&&e.call_analysis.call_summary&&m.push({speaker:"Résumé",text:e.call_analysis.call_summary});D.value=m,T.value=!!(e.call_analysis&&e.call_analysis.transcription_error||!e.transcript&&!(e.call_analysis&&(e.call_analysis.turns||e.call_analysis.segments||e.call_analysis.call_summary)))}catch{D.value=[],T.value=!1}O.value=!0},te=async()=>{try{const a=F(k.value?.raw_payload);await navigator.clipboard.writeText(a),alert("JSON copié dans le presse-papiers")}catch(a){alert("Impossible de copier le JSON: "+(a?.message||a))}},z=async()=>{try{const{data:{user:a}}=await j.auth.getUser();if(!a)return;const e=await fetch(`/api/user-plan?user_id=${a.id}`);if(!e.ok)return;const m=await e.json();w.value=m.plan||null}catch{}},se=async a=>{if(confirm("Êtes-vous sûr de vouloir arrêter cette campagne ?"))try{const{error:e}=await j.from("campaigns").update({status:"stopped"}).eq("id",a);if(e)throw e;await q()}catch(e){C.value=e.message||"Erreur lors de l'arrêt de la campagne"}};oe(()=>{q(),z(),window.addEventListener("plan:updated",z)}),le(()=>{window.removeEventListener("plan:updated",z)});const F=a=>{try{return JSON.stringify(a,null,2)}catch{return String(a)}};return(a,e)=>{const m=ie("tooltip");return u(),c("div",Ce,[t("div",De,[o(r(L),{class:"mb-6 shadow-md border border-gray-200"},{content:p(()=>[t("div",Ne,[t("div",je,[e[8]||(e[8]=t("h1",{class:"text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"}," Dashboard ",-1)),e[9]||(e[9]=t("p",{class:"text-gray-600 text-base sm:text-lg"},"Gérez vos campagnes de prospection",-1)),w.value?(u(),c("div",Ae,[o(r($),{value:w.value.plan_slug||w.value.name||"Plan actif",severity:"info"},null,8,["value"]),t("div",Pe,[w.value.included_minutes?(u(),c("div",Ee,"Inclus: "+d(w.value.included_minutes)+" min",1)):y("",!0),w.value.expires_at?(u(),c("div",Re,"Expire: "+d(J(w.value.expires_at)),1)):y("",!0)])])):y("",!0)]),t("div",Oe,[o(r(b),{label:"Techniques",icon:"pi pi-book",severity:"secondary",outlined:"",onClick:e[0]||(e[0]=s=>a.$router.push("/techniques")),class:"w-full sm:w-auto"}),o(r(b),{label:"Nouvelle Campagne",icon:"pi pi-plus",onClick:e[1]||(e[1]=s=>a.$router.push("/campaign")),class:"w-full sm:w-auto"})])])]),_:1}),x.value?(u(),c("div",Te,[o(r(Y))])):y("",!0),C.value?(u(),P(r(K),{key:1,severity:"error",closable:!1,class:"mb-6"},{default:p(()=>[g(d(C.value),1)]),_:1})):y("",!0),!x.value&&i.value.length===0?(u(),P(r(L),{key:2,class:"text-center py-12 shadow-md border border-gray-200"},{content:p(()=>[e[10]||(e[10]=t("i",{class:"pi pi-rocket text-6xl text-gray-700 mb-4"},null,-1)),e[11]||(e[11]=t("h2",{class:"text-2xl font-bold text-gray-900 mb-2"},"Commencez votre première campagne",-1)),e[12]||(e[12]=t("p",{class:"text-gray-600 mb-6"},"Créez une nouvelle campagne de prospection pour démarrer",-1)),o(r(b),{label:"Créer une Campagne",icon:"pi pi-plus-circle",onClick:e[2]||(e[2]=s=>a.$router.push("/campaign"))})]),_:1})):y("",!0),!x.value&&i.value.length>0?(u(),c("div",Be,[t("div",Je,[t("div",ze,[o(r(b),{severity:_.value==="grid"?"primary":"secondary",label:"Cartes",icon:"pi pi-th-large",onClick:e[3]||(e[3]=s=>_.value="grid")},null,8,["severity"]),o(r(b),{severity:_.value==="list"?"primary":"secondary",label:"Liste",icon:"pi pi-list",onClick:e[4]||(e[4]=s=>_.value="list")},null,8,["severity"])])]),_.value==="grid"?(u(),c("div",Le,[(u(!0),c(M,null,W(i.value,s=>(u(),P(r(L),{key:s.id,class:"hover:shadow-xl transition-all duration-300 hover:-translate-y-2"},{header:p(()=>[t("div",qe,[t("div",Ue,[t("h3",Ve,d(s.company_name),1),o(r($),{value:U(s.status),severity:B(s.status)},null,8,["value","severity"])])])]),content:p(()=>[t("div",Ie,[t("div",Fe,[e[13]||(e[13]=t("span",{class:"text-gray-600 font-medium"},"Secteur:",-1)),t("span",Me,d(s.domain),1)]),t("div",We,[e[14]||(e[14]=t("span",{class:"text-gray-600 font-medium"},"Agent:",-1)),t("span",Ge,d(s.agent_name),1)]),t("div",Ke,[e[15]||(e[15]=t("span",{class:"text-gray-600 font-medium"},"Contacts:",-1)),o(r(ue),{value:s.contacts_count||0,severity:"info"},null,8,["value"])]),t("div",He,[e[16]||(e[16]=t("span",{class:"text-gray-600 font-medium"},"Objectif:",-1)),t("span",Qe,d(V(s.objectifs)),1)]),t("div",Xe,[e[17]||(e[17]=t("span",{class:"text-gray-600 font-medium"},"Créée le:",-1)),t("span",Ye,d(J(s.created_at)),1)])])]),footer:p(()=>[t("div",Ze,[o(r(b),{label:"Détails",icon:"pi pi-eye",severity:"secondary",outlined:"",onClick:N=>I(s),class:"flex-1"},null,8,["onClick"]),s.status==="pending"||s.status==="running"?de((u(),P(r(b),{key:0,icon:"pi pi-stop",severity:"danger",outlined:"",onClick:N=>se(s.id)},null,8,["onClick"])),[[m,"Arrêter la campagne"]]):y("",!0)])]),_:2},1024))),128))])):y("",!0),_.value==="list"?(u(),c("div",et,[o(r(H),{value:i.value,responsiveLayout:"scroll"},{default:p(()=>[o(r(v),{field:"company_name",header:"Entreprise"}),o(r(v),{field:"domain",header:"Secteur"}),o(r(v),{field:"agent_name",header:"Agent"}),o(r(v),{field:"contacts_count",header:"Contacts"}),o(r(v),{field:"status",header:"Statut"},{body:p(s=>[o(r($),{value:U(s.data.status),severity:B(s.data.status)},null,8,["value","severity"])]),_:1}),o(r(v),{field:"created_at",header:"Créée le"},{body:p(s=>[g(d(J(s.data.created_at)),1)]),_:1}),o(r(v),{header:"Actions"},{body:p(s=>[t("div",tt,[o(r(b),{label:"Détails",icon:"pi pi-eye",class:"p-button-sm",onClick:N=>I(s.data)},null,8,["onClick"])])]),_:1})]),_:1},8,["value"])])):y("",!0)])):y("",!0),o(r(G),{visible:h.value,"onUpdate:visible":e[5]||(e[5]=s=>h.value=s),header:l.value?`Détails: ${l.value.company_name}`:"",style:{width:"90vw",maxWidth:"800px"},modal:!0,closable:!0},{default:p(()=>[l.value?(u(),c("div",st,[t("div",null,[e[22]||(e[22]=t("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Informations Entreprise",-1)),t("div",nt,[t("p",null,[e[18]||(e[18]=t("strong",null,"Nom:",-1)),g(" "+d(l.value.company_name),1)]),t("p",null,[e[19]||(e[19]=t("strong",null,"Secteur:",-1)),g(" "+d(l.value.domain),1)]),t("p",null,[e[20]||(e[20]=t("strong",null,"Promesse de valeur:",-1)),g(" "+d(l.value.value_proposition),1)]),t("p",null,[e[21]||(e[21]=t("strong",null,"Détails:",-1)),g(" "+d(l.value.infos),1)])])]),o(r(A)),t("div",null,[e[25]||(e[25]=t("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Configuration Agent",-1)),t("div",rt,[t("p",null,[e[23]||(e[23]=t("strong",null,"Nom:",-1)),g(" "+d(l.value.agent_name),1)]),t("p",null,[e[24]||(e[24]=t("strong",null,"Seuil de confiance:",-1)),g(" "+d(l.value.confidence_threshold),1)])])]),o(r(A)),t("div",null,[e[27]||(e[27]=t("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Objectifs",-1)),t("p",null,[e[26]||(e[26]=t("strong",null,"Type:",-1)),g(" "+d(V(l.value.objectifs)),1)])]),l.value.results&&l.value.results.length>0?(u(),c("div",at,[o(r(A)),e[28]||(e[28]=t("h3",{class:"text-lg font-semibold mb-3 text-gray-900"},"Résultats de Prospection",-1)),o(r(H),{value:l.value.results,paginator:!0,rows:5,class:"p-datatable-sm"},{default:p(()=>[o(r(v),{field:"call_id",header:"Call ID"},{body:p(s=>[g(d(s.data.call_id||s.data.raw_payload?.call_id||"-"),1)]),_:1}),o(r(v),{field:"to",header:"Vers"},{body:p(s=>[g(d(s.data.contact_phone||s.data.raw_payload?.to_number||"-"),1)]),_:1}),o(r(v),{field:"from",header:"Depuis"},{body:p(s=>[g(d(s.data.raw_payload?.from_number||"-"),1)]),_:1}),o(r(v),{field:"start",header:"Début"},{body:p(s=>[g(d(Z(s.data.raw_payload?.start_timestamp)),1)]),_:1}),o(r(v),{field:"status",header:"Statut"},{body:p(s=>[o(r($),{value:s.data.status,severity:B(s.data.status)},null,8,["value","severity"])]),_:1}),o(r(v),{field:"summary",header:"Résumé"},{body:p(s=>[g(d(s.data.raw_payload?.call_analysis?.call_summary||s.data.notes||"-"),1)]),_:1}),o(r(v),{header:"Raw"},{body:p(s=>[o(r(b),{label:"Voir",class:"p-button-sm",onClick:N=>ee(s.data)},null,8,["onClick"])]),_:1})]),_:1},8,["value"])])):y("",!0)])):y("",!0)]),_:1},8,["visible","header"]),o(r(G),{visible:O.value,"onUpdate:visible":e[7]||(e[7]=s=>O.value=s),header:"Payload brut",style:{width:"90vw",maxWidth:"900px"},modal:!0},{default:p(()=>[k.value?(u(),c("div",ot,[t("div",lt,[t("div",null,[e[32]||(e[32]=t("h4",{class:"font-semibold mb-2"},"Résumé",-1)),t("p",null,[e[29]||(e[29]=t("strong",null,"Contact:",-1)),g(" "+d(k.value.contact_name||k.value.contact_phone),1)]),t("p",null,[e[30]||(e[30]=t("strong",null,"Statut:",-1)),g(" "+d(k.value.status),1)]),t("p",null,[e[31]||(e[31]=t("strong",null,"Durée:",-1)),g(" "+d(k.value.call_duration)+"s",1)])]),t("div",it,[o(r(b),{label:"Copier JSON",icon:"pi pi-copy",class:"p-button-sm",onClick:te}),o(r(b),{label:R.value?"Masquer JSON":"Afficher JSON",class:"p-button-sm",onClick:e[6]||(e[6]=s=>R.value=!R.value)},null,8,["label"])])]),o(r(A)),t("div",null,[e[33]||(e[33]=t("h4",{class:"font-semibold mb-2"},"Conversation",-1)),T.value?(u(),c("div",dt,[o(r(K),{severity:"warn",text:"Problème détecté lors de la transcription — le rendu peut être incomplet."})])):y("",!0),D.value&&D.value.length?(u(),c("div",ut,[t("div",ct,[(u(!0),c(M,null,W(D.value,(s,N)=>(u(),c("div",{key:N,class:"p-2 rounded"},[t("div",pt,[o(r($),{value:s.speaker,severity:"secondary"},null,8,["value"]),t("span",gt,d(s.time||""),1)]),t("div",yt,d(s.text),1)]))),128))])])):(u(),c("div",vt,"Aucun contenu conversationnel détecté. Voir le JSON brut pour plus de détails."))]),o(r(A)),R.value?(u(),c("div",mt,[e[34]||(e[34]=t("h4",{class:"font-semibold mb-2"},"Payload JSON",-1)),t("pre",ft,d(F(k.value.raw_payload)),1)])):y("",!0)])):y("",!0)]),_:1},8,["visible"])])])}}};export{St as default};
