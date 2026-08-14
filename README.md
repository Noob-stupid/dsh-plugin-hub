
<img width="1170" height="609" alt="image" src="https://github.com/user-attachments/assets/b802d606-14ba-4151-9956-ff642ed12b0a" />

# DSH 鎻掍欢涓績锛坉sh-plugin-hub锛?

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

缁?DeepSeek Harness锛圖SH锛塛eb 鐣岄潰鍔犱笂**鎻掍欢绠＄悊闈㈡澘**锛氫竴閿惎鐢?鍋滅敤宸插畨瑁呮彃浠讹紝
骞剁洿鎺ュ湪 **GitHub 涓婃祻瑙?dsh-plugin 鎻掍欢椤圭洰**锛屼竴閿坊鍔犲苟鍚敤銆?

- 瀹夸富绔細鐜洖 HTTP 璺敱锛坰tate / toggle / search / repo / install锛夛紝鐩存帴璇诲啓
  profile 鐢ㄦ埛琛ヤ竵灞?`cordis.patch.yml`锛岀敱 DSH 鐨?HMR 鑷姩鐢熸晥锛?
- 娴忚鍣ㄧ锛氳缃?鈫?鎻掍欢 鈫?**鎻掍欢绠＄悊** tab锛堝紑鍏冲垪琛?+ GitHub 鎻掍欢甯傚満锛夛紱
- 鎻掍欢甯傚満璧?*娴忚鍣ㄧ洿杩?GitHub**锛堜綘鐨勬祻瑙堝櫒鑳芥墦寮€ GitHub锛屽競鍦哄氨鑳界敤锛?
  鎵撲笉寮€鏃惰嚜鍔ㄥ洖閫€鍒版湇鍔＄閫氶亾锛夈€?

## 涓€閿儴缃?

### 鏂瑰紡涓€锛氬畼鏂瑰懡浠わ紙鎺ㄨ崘锛?

鎻掍欢澹版槑浜?`dsh.bundle` 瀹樻柟娓呭崟锛屼竴鏉″懡浠よ濂藉苟鑷姩鍚敤锛?

```sh
dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub
```

鐒跺悗閲嶅惎 dsh 鏈嶅姟 鈫?鍒锋柊椤甸潰 鈫?璁剧疆 鈫?鎻掍欢 鈫?鎻掍欢绠＄悊銆?

### 鏂瑰紡浜岋細閮ㄧ讲鑴氭湰锛堢綉缁滃彈闄愭椂鐨勫厹搴曪級

Windows锛圥owerShell锛夛細

```powershell
git clone https://github.com/Noob-stupid/dsh-plugin-hub "$env:TEMP\dsh-plugin-console" 2>$null; & "$env:TEMP\dsh-plugin-console\deploy.ps1"
```

Linux / macOS锛?

```bash
git clone https://github.com/Noob-stupid/dsh-plugin-hub /tmp/dsh-plugin-console 2>/dev/null; bash /tmp/dsh-plugin-console/deploy.sh
```

鑴氭湰浼氬仛涓や欢浜嬶細鎶婃彃浠跺寘鎷疯繘 `$DSH_HOME/profiles/<profile>/node_modules/`锛?
骞跺湪 `cordis.patch.yml` 骞傜瓑杩藉姞鍚敤鏉＄洰銆傚畬鎴愬悗锛?

1. 閲嶅惎 dsh 鏈嶅姟锛堝涓讳唬鐮佸彉鏇撮渶瑕侀噸鍚繘绋嬶紱鍛戒护琛屾柟寮忛噸鍚繘绋嬶紝妗岄潰瀹㈡埛绔€€鍑洪噸寮€锛夛紱
2. 鍒锋柊椤甸潰 鈫?璁剧疆 鈫?鎻掍欢 鈫?**鎻掍欢绠＄悊**銆?

瑕佹眰锛欴SH 鈮?0.1.0-rc.6锛坵eb profile锛屽惈 `dsh-client-modules` / `dsh-host-plugin-inventory`锛夈€?

## 鍔熻兘

### 宸插畨瑁呮彃浠讹紙涓€閿紑鍏?+ 璇︽儏锛?

- 鍒楀嚭鍏ㄩ儴鎻掍欢鏉＄洰锛堝悕绉般€佸姞杞界姸鎬併€佸惎鐢ㄧ姸鎬侊級锛?
- 鐐广€屽仠鐢ㄣ€? 鍦ㄧ敤鎴疯ˉ涓佸眰鍐欏叆 `- id: X` + `disabled: true`锛孒MR 绔嬪嵆鐢熸晥锛?
- 鐐广€屽惎鐢ㄣ€? 绉婚櫎璇ュ仠鐢ㄦ潯鐩紱bundle 灞傛湰灏卞仠鐢ㄧ殑琛岀敤 `disabled: false` 瑕嗙洊锛?
- 鎵撴爣銆岃ˉ涓佸仠鐢?/ 琛ヤ竵寮哄埗鍚敤銆嶅尯鍒嗙敤鎴疯ˉ涓佺姸鎬侊紱
- **鍩虹璁炬柦淇濇姢**锛歨ost 浼犺緭/鐑姞杞?瀛樺偍/璁剧疆閾句笂鐨勬彃浠讹紙timer銆乭mr銆亀ebserver 绛?
  70+ 琛岋級鏍囪銆屽彈淇濇姢銆嶏紝绂佹寮€鍏斥€斺€旇鍋滅敤浼氱牬鍧忕儹鍔犺浇鏈韩锛?
- **璇︽儏闈㈡澘**锛氭瘡涓彃浠跺彲鐐广€岃鎯呫€嶏紝灞曞紑绠€浠嬨€佺増鏈€佷粨搴?涓婚〉閾炬帴涓?README
  鎽樿锛堣鍙栨彃浠跺寘鑷甫鐨?README锛岃鏄庡畠鐨勪綔鐢級銆?

### 鎻掍欢甯傚満锛圙itHub锛?

- 榛樿鎼滅储 `dsh-plugin`锛堜笌 GitHub 缃戦〉鎼滅储 `https://github.com/search?q=dsh-plugin&type=repositories` 涓€鑷达級锛?
- 鏌ョ湅浠撳簱鐨?npm 鍖呭悕銆丏SH 鎻掍欢鐗瑰緛鎻愮ず涓?**README 鎽樿**锛堟祻瑙堝櫒鐩磋繛 GitHub锛岃鏄庢彃浠朵綔鐢級锛?
- 銆屾坊鍔犲苟鍚敤銆? npm 瀹夎璇ュ寘鍒?profile锛坮egistry 澶辫触鑷姩鍥為€€ `github:owner/repo`锛?
  + 鍐欏叆鍚敤鏉＄洰锛孒MR 鐢熸晥銆?

## 鍘熺悊

DSH 鐨?web profile 鐢?bundle 琛ヤ竵灞?+ 鐢ㄦ埛琛ヤ竵灞傦紙`$DSH_HOME/profiles/web/cordis.patch.yml`锛?
缁勫悎鑰屾垚锛岃ˉ涓佹槸**閫愰敭瑕嗙洊**璇箟銆傛彃浠跺紑鍏冲彧鏄線鐢ㄦ埛琛ヤ竵灞傝拷鍔?绉婚櫎涓よ YAML锛?

```yaml
- id: 鎻掍欢鏉＄洰id
  disabled: true
```

閰嶇疆鏂囦欢鐩戣鍣紙HMR锛変細鍦ㄤ繚瀛樺悗 1 绉掑唴閲嶇粍鍚堬紝鏃犻渶閲嶅惎鈥斺€旈櫎瀹夸富浠ｇ爜鏈韩鍙樻洿澶栥€?

## 鍏煎鎬х瓥鐣?

- 褰撳墠鏀寔 **DSH 0.1.0 绯诲垪**锛坄0.1.0-rc.6` 鍙婂悓绯诲垪鐗堟湰锛夈€?
- 闈㈡澘浼氳鍙栬繍琛屼腑鐨?`@deepseek-ai/dsh-web-app` 鐗堟湰锛氬畼鏂瑰彂甯冪牬鍧忔€у崌绾?
  锛?.2 / 1.0 绛夛級鍚庯紝闈㈡澘椤堕儴浼氭樉绀哄吋瀹规€ц鍛婂苟缁欏嚭鏈粨搴撳湴鍧€锛岃€屼笉鏄粯榛樺け鏁堛€?
- 瀹樻柟鐮村潖鎬ф洿鏂板彲鑳芥敼鍔ㄧ殑鎺ュ彛锛氳ˉ涓佸眰璇箟銆乣webServer.register`銆?
  鍔犺浇鍣ㄦ潯鐩粨鏋勩€乣dsh.client` bundle 鏍煎紡銆乣settings.plugins.tab` 鎻掓Ы銆?
  灞婃椂闅忓畼鏂圭増鏈洿鏂版湰浠撳簱鍗冲彲锛堜緷璧栭潰宸叉敹绐勫埌涓婅堪鍑犱釜鐐癸級銆?
- 閮ㄧ讲鑴氭湰涓嶆牎楠岀増鏈€佺洿鎺ュ畨瑁咃紱闈㈡澘閲岀殑璀﹀憡鏄潈濞佹彁绀恒€?

## 椤圭洰缁撴瀯

```
lib/index.js       瀹夸富绔彃浠讹紙/plugin-console/* 璺敱 + 琛ヤ竵璇诲啓 + npm 瀹夎锛?
lib/client.js      娴忚鍣ㄧ bundle锛圡oduleLoader 鏍煎紡锛岃缃〉 tab锛?
deploy.ps1 / deploy.sh   涓€閿儴缃茶剼鏈紙Windows / Linux路macOS锛?
test-harness.mjs   閫昏緫鑷锛坰tate/toggle/鏍￠獙/鐜洖淇濇姢锛涙悳绱㈣缃戠粶鐜 SKIP锛?
```

## 瀹夊叏璇存槑

- 鍏ㄩ儴璺敱浠呭厑璁哥幆鍥炲湴鍧€璁块棶锛?
- GitHub 鍏冩暟鎹彧鐢ㄤ簬鍙戠幇鍏紑鎻掍欢锛宯pm 瀹夎璧?registry 鐨勫畬鏁?TLS 鏍￠獙锛?
- 鎻掍欢甯傚満鎼滅储鍦ㄦ祻瑙堝櫒鍐呯洿杩?GitHub锛屼笉缁忚繃鏈嶅姟绔€?

## 甯姪 / Help

閬囧埌闂鍏堢湅杩欓噷锛涗粛鏈夌枒闂鍒?[Issues](https://github.com/Noob-stupid/dsh-plugin-hub/issues) 鎻愰棶銆?

- **闈㈡澘娌″嚭鐜?*锛氶噸鍚?dsh 鏈嶅姟 鈫?鍒锋柊椤甸潰 鈫?璁剧疆 鈫?鎻掍欢 鈫?鎻掍欢绠＄悊銆?
- **鐐瑰紑鍏虫病鍙嶅簲**锛氬熀纭€璁炬柦琛屽甫"鍙椾繚鎶?鏍囩锛堢姝㈠紑鍏筹紝杩欐槸淇濇姢鏈哄埗锛夛紱鏅€氭彃浠跺紑鍏崇粡
  HMR 鐢熸晥锛岀害 1-3 绉掞紝鍙偣鍒锋柊鏌ョ湅銆?
- **椤堕儴鍑虹幇鍏煎鎬ц鍛?*锛氬畼鏂瑰彂甯冧簡鐮村潖鎬ф洿鏂帮紝璇峰埌鏈粨搴撹幏鍙栭€傞厤鐗堟湰锛堣鍏煎鎬х瓥鐣ワ級銆?
- **甯傚満鎼滅储娌＄粨鏋?鎶ラ敊**锛氬競鍦鸿蛋娴忚鍣ㄧ洿杩?GitHub锛堜笌娴忚鍣ㄥ彲鐢ㄦ€т竴鑷达級锛屽け璐ヨ嚜鍔ㄥ洖閫€
  鏈嶅姟绔€氶亾锛涚綉缁滈粦娲炴湡璇风◢鍚庨噸璇曘€?
- **瀹夎澶辫触**锛氱‘璁や粨搴撴湁 package.json 涓斿寘鍚嶅凡鍙戝竷鍒?npm锛沶pm 瑁呬笉浜嗙殑浼氬洖閫€
  `github:owner/repo` 瀹夎锛堥渶瑕?git锛夈€?

## License

MIT
