import { chromium } from "playwright"

let browser:any=null

export async function getBrowser(){

if(!browser){

browser=await chromium.launch({

executablePath:"/usr/bin/chromium",

headless:true,

args:["--no-sandbox"]

})

}

return browser

}