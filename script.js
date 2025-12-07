async function syncTime() {
      statusEl.textContent = 'Синхронизация с сервером времени...';
      try {
        const resp = await fetch(API_URL, {cache: 'no-store'});
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();

        if (data.unixtime !== undefined) {

          const nowSec = data.unixtime;

          let fracMs = 0;
          if (data.datetime) {
            const msMatch = data.datetime.match(/\.(\d{1,3})/);
            if (msMatch) {
              fracMs = parseInt(msMatch[1].padEnd(3,'0'), 10);
            }
          }
          serverUnixMs = nowSec * 1000 + fracMs;
        } else if (data.datetime) {
          serverUnixMs = Date.parse(data.datetime);
        } else {
   
          serverUnixMs = Date.now();
        }
        
        if (data.utc_offset) {
          const sign = data.utc_offset[0] === '-' ? -1 : 1;
          const parts = data.utc_offset.slice(1).split(':');
          offsetMs = sign * (parseInt(parts[0],10)*3600 + parseInt(parts[1]||'0',10)*60) * 1000;
        }
        perfAtSync = performance.now();
        statusEl.textContent = 'Синхронизировано с сервером времени (' + TIMEZONE + ').';
        return true;
      } catch (err) {
        console.warn('Sync error', err);
        statusEl.textContent = 'Не удалось синхронизироваться с сервером времени. Используется локальное время.';

        const localNow = new Date();

        try {
          const parts = new Intl.DateTimeFormat('en-US', {timeZone: TIMEZONE, hour12:false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit'}).formatToParts(localNow);
   
          const obj = {};
          parts.forEach(p=>{ if(p.type!=='literal') obj[p.type]=p.value; });
`          const tzDateStr = ${obj.year}-${obj.month}-${obj.day}T${obj.hour}:${obj.minute}:${obj.second};`
          serverUnixMs = Date.parse(tzDateStr);
          perfAtSync = performance.now();
          return false;
        } catch(e){
         
          serverUnixMs = Date.now();
          perfAtSync = performance.now();
          return false;
        }
      }
    }


    function formatTime(date) {
  
      const hh = String(date.getHours())
      const mm = String(date.getMinutes())
      const ss = String(date.getSeconds())
    `  return ${hh}:${mm}:${ss};`
    }



    function startClock() {}
      function tick() {
        const now = new Date(serverUnixMs + (performance.now() - perfAtSync));

        timeEl.textContent = formatTime(now);
        dateEl.textContent = formatDate(now);
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);