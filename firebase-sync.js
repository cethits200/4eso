// Daniela 4 ESO — Firebase Authentication + Firestore, acceso restringido por reglas UID.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getFirestore,doc,onSnapshot,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const config={apiKey:'AIzaSyBF-B1XEpBxYiTpAqfdPAfoQFNqtSClEBQ',authDomain:'daniela-4eso.firebaseapp.com',projectId:'daniela-4eso',storageBucket:'daniela-4eso.firebasestorage.app',messagingSenderId:'301919467268',appId:'1:301919467268:web:aa21d019a5511a87e28251'};
const auth=getAuth(initializeApp(config)),db=getFirestore(auth.app),ref=doc(db,'familias','daniela','data','shared');
let user=null,unsubscribe=null,cloud=null,loaded=false,busy=false,status='Sin conectar';
const el=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=()=>({exams:JSON.parse(localStorage.getItem('d4_exams')||'[]'),grades:JSON.parse(localStorage.getItem('d4_grades')||'[]')});
const backup=()=>{const d=local();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({...d,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}));a.download='daniela-copia-agenda-notas.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
function render(){const mount=el('syncMount');if(!mount)return;let h='<section class="sync-panel"><h3>☁️ Sincronización de Agenda y Notas</h3><p class="sync-state">'+escapeHTML(status)+'</p>';
 if(!user){h+='<p>Inicia sesión con la cuenta autorizada de Firebase para compartir fechas y notas entre dispositivos.</p><form id="syncLogin"><input id="syncEmail" type="email" autocomplete="username" placeholder="Correo autorizado" required><input id="syncPass" type="password" autocomplete="current-password" placeholder="Contraseña" required><button type="submit">🔐 Conectar</button></form>'}
 else {h+='<p>Sesión: '+escapeHTML(user.email||'usuario autorizado')+'</p>';if(loaded){if(cloud===null){h+='<p>La nube todavía está vacía. Puedes subir los datos guardados en este dispositivo.</p><button id="syncUpload" class="warning">Subir datos de este dispositivo</button>'}else{h+='<p>Los datos de la nube se comparten automáticamente. Los datos locales anteriores se han guardado como copia de seguridad antes de sustituirse.</p>'}}h+='<button id="syncBackup" class="secondary">Descargar copia local</button><button id="syncLogout" class="secondary">Cerrar sesión</button>'}
 h+='</section>';mount.innerHTML=h;
 if(el('syncLogin'))el('syncLogin').onsubmit=async e=>{e.preventDefault();const email=el('syncEmail').value,password=el('syncPass').value;status='Conectando…';render();try{await signInWithEmailAndPassword(auth,email,password)}catch(err){status='No se pudo iniciar sesión: '+err.code;render()}};
 if(el('syncBackup'))el('syncBackup').onclick=backup;
 if(el('syncLogout'))el('syncLogout').onclick=()=>signOut(auth);
 if(el('syncUpload'))el('syncUpload').onclick=async()=>{if(!confirm('¿Subir las fechas y notas de este dispositivo a la nube? Esta acción iniciará la sincronización compartida.'))return;try{busy=true;status='Subiendo datos…';render();const d=local();await setDoc(ref,{exams:d.exams,grades:d.grades,updatedAt:serverTimestamp()});status='Datos subidos correctamente';}catch(err){status='Error al subir: '+err.code}finally{busy=false;render()}};
}
function applyCloud(data){if(busy)return;const newExams=Array.isArray(data.exams)?data.exams:[],newGrades=Array.isArray(data.grades)?data.grades:[];
 const old=local();if(!sessionStorage.getItem('d4_cloud_backup_done')&&(old.exams.length||old.grades.length)) {localStorage.setItem('d4_backup_before_cloud_'+Date.now(),JSON.stringify(old));sessionStorage.setItem('d4_cloud_backup_done','1')}
 window.exams=newExams;window.grades=newGrades; // lexical top-level let is not window property; update through bridge below
 if(window.danielaApplyCloud)window.danielaApplyCloud(newExams,newGrades);
 localStorage.setItem('d4_exams',JSON.stringify(newExams));localStorage.setItem('d4_grades',JSON.stringify(newGrades));
 if(window.refreshSharedView)window.refreshSharedView();
}
window.danielaSync={render,save:async(exams,grades)=>{if(!user||!loaded||cloud===null){status='Guardado localmente. Conecta y sube los datos para compartirlos.';render();return}try{busy=true;status='Guardando en la nube…';render();await setDoc(ref,{exams,grades,updatedAt:serverTimestamp()});status='☁️ Sincronizado';}catch(err){status='Error de sincronización: '+err.code+' (datos guardados en este dispositivo)'}finally{busy=false;render()} }};
onAuthStateChanged(auth,u=>{if(unsubscribe){unsubscribe();unsubscribe=null}user=u;loaded=false;cloud=null;status=u?'Conectando con la nube…':'Sin conectar · datos locales';render();if(!u)return;unsubscribe=onSnapshot(ref,snap=>{loaded=true;if(snap.exists()){cloud=snap.data();status='☁️ Sincronizado';applyCloud(cloud)}else{cloud=null;status='Nube vacía · pendiente de importar datos locales'}render()},err=>{loaded=false;status='Acceso denegado o sin conexión: '+err.code;render()})});
