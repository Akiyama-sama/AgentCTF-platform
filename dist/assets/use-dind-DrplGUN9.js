import{c as h}from"./index-DSZ_lwlW.js";import{o as m,p as D}from"./use-scenario-CWX--LNn.js";import{o as M,r as n}from"./index-jJ-r5mz2.js";/**
 * @license lucide-react v0.523.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],x=h("copy",P),F=s=>{const r=M(),i=m(s),d=r.getQueryData(i),{data:t,isSuccess:u,isLoading:y,isError:p,error:k}=D(s,{query:{enabled:!!s&&!d,select:e=>e.data,retry:3}}),l=n.useMemo(()=>{const e={},c=t?.packet_files||{},o=Object.keys(c);for(const a of o)e[a]=c[a].absolute_path;return e},[t]),f=n.useMemo(()=>{const e=t?.packet_files||{};return Object.keys(e).map(o=>e[o].absolute_path)},[t]);return{dindPackageInfo:l,dindPackageInfoList:f,isLoading:y,isSuccess:u,isError:p,error:k}};export{x as C,F as u};
