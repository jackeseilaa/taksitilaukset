import json,html,sys
D=json.load(open('data.json'))
css=open('style.css').read()
# ohuet viivat, ohut fontti, ei lihavointia
extra='''
*{font-family:Carlito,Liberation Sans,Arial,sans-serif !important;font-weight:400 !important;color:#000 !important}
td,td *{font-weight:400 !important}
.c b,.u b{font-weight:400 !important}
td{font-size:18px !important;line-height:1.15}
td.l{font-size:18px !important;width:24mm}
.s{font-size:17px !important}
th,td{border:1px solid #000 !important}
.c,.chk,.u,.ln,.sign{border-width:1px !important}
.c{border:1px solid #000 !important}
.chk{border:1px solid #000 !important}
.u{border-bottom:1px solid #000 !important}
.sign{border-top:1px solid #000 !important}
'''
e=lambda s:html.escape(s)
def fld(l,v): return '<div class="c"><small>%s</small>%s</div>'%(e(l),('<b>%s</b>'%e(v)) if v else '')
def eur(l,u,v): return '<div class="u"><small>%s</small>%s<span>%s</span></div>'%(e(l),('<b>%s</b>'%e(v)) if v else '',u)
chk=''.join('<span><i></i>%s</span>'%x for x in ['Rekisteriote','Liikennelupa','Diesel-kortti','Autopuhelin','Laturi','LK-tägi','HTD-puhelin'])
pages=''
for p in D:
    f=p['f'];rs=p['r'];n=max(5,len(rs));trs=''
    for i in range(n):
        if i<len(rs):
            t,pr,m,s=rs[i]
            trs+='<tr><td class="l">%s%s</td><td>%s<br><span class="s">%s</span></td></tr>'%(e(t),('<br>'+e(pr)) if pr else '',e(m),e(s))
        else: trs+='<tr><td class="l">&nbsp;</td><td>&nbsp;</td></tr>'
    km=p['km']
    pages+=('<div class="page"><div class="rot"><div class="note">Tilitykset tuotava vähintään kerran viikossa.</div><div class="h"><span>TAKSIPALVELU SIMONEN OY</span><span class="t">AJOPÄIVÄKIRJA</span></div>'
    +'<div class="g4">'+fld('Auto nro. (taksikupu)',f[0])+fld('Auto rek.nro.:',f[1])+fld('Kuljettajan ID:',f[2])+fld('Kuljettajan sukunimi + etunimi',f[3])+'</div>'
    +'<div class="two"><div class="lc"><div class="g3b">'+fld('Aloitus pvm:',f[4])+fld('Klo:',f[5])+'<div class="c tauot"><small>Tauot:</small></div>'+fld('Lopetus pvm:',f[7])+fld('Klo:',f[8])+'</div>'
    +'<div class="chk"><small>Lähtiessä autossa oli</small>'+chk+'</div>'
    +'<table><thead><tr><th class="l">Poikkeavat ajot:</th><th>Laskutustiedot: klo-klo, mistä mihin (osoitteet), muuta huomioitavaa, asiakastiedot:</th></tr></thead><tbody>'+trs+'</tbody></table></div>'
    +'<div class="rc">'+''.join(eur(l,'km',k) for l,k in zip(['Matkamittari alussa','Matkamittari lopussa','Ajettu'],km))+'<div class="tl">TILITYS</div>'
    +''.join(eur(l,'€',{'Kassa':p['kassa'],'Käteis':p['kateis'],'EMV':p['emv']}.get(l,'')) for l in ['Kassa','Käteis','EMV','T-kortti','O-lasku','Ostot','Kela','Taksi-Helsinki -laskutus'])
    +'<div class="sign">Kuljettajan allekirjoitus</div></div></div></div></div>')
open('out.html','w').write('<!DOCTYPE html><html lang="fi"><head><meta charset="utf-8"><style>'+css+extra+'</style></head><body>'+pages+'</body></html>')
