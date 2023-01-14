"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDescription = exports.formatDate = exports.formatDiscount = exports.getOption = void 0;
const getOption = (discount) => {
    var options = {
        'method': 'POST',
        'url': 'https://www.hargapedia.com.my/api/voucher_external/getVoucherBySlug',
        'headers': {
            'authority': 'www.hargapedia.com.my',
            'accept': 'application/json',
            'accept-language': 'en-US,enq=0.9',
            'content-type': 'application/json',
            'cookie': '_fbp=fb.2.1667202722397.116271886 __gads=ID=b71f34b8d94cf7d3-22cb1cbaf1d700d0:T=1667202760:RT=1667202760:S=ALNI_Maa6lWbDg6S6z_MRnh6qRtcV01hYA __gpi=UID=00000b71e835222d:T=1667202760:RT=1667202760:S=ALNI_MZPRlTxikG59pBXfp7lTrpEtb_tuw _gid=GA1.3.336551804.1667372930 _gat_UA-103785735-23=1 _ga_CJ6DC28P12=GS1.1.1667372930.5.0.1667372930.0.0.0 _ga=GA1.1.1880982553.1667202721 ph_phc_cqi5WBfMGLLn6sGu0XqiGq8Dm1U2GRxxyQgIKJ4aWGD_posthog=%7B%22distinct_id%22%3A%221825c2a43587f-0058d74c39db05-26021a51-100200-1825c2a43592cc%22%2C%22%24device_id%22%3A%221825c2a43587f-0058d74c39db05-26021a51-100200-1825c2a43592cc%22%2C%22%24search_engine%22%3A%22google%22%2C%22%24referrer%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22%24referring_domain%22%3A%22www.google.com%22%2C%22%24sesid%22%3A%5B1667372958149%2C%22184372bd35d575-0b658ad4c61d19-26021e51-100200-184372bd35e4b5%22%2C1667372929884%5D%2C%22%24session_recording_enabled_server_side%22%3Atrue%2C%22%24active_feature_flags%22%3A%5B%5D%2C%22%24enabled_feature_flags%22%3A%7B%7D%7D',
            'dnt': '1',
            'origin': 'https://www.hargapedia.com.my',
            'referer': 'https://www.hargapedia.com.my/vouchers/store/lazada?voucher=lazada-free-shipping-1',
            'sec-ch-ua': '"Google Chrome"v="107", "Chromium"v="107", "Not=A?Brand"v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
            "slug": formatDiscount(discount),
        })
    };
    return options;
};
exports.getOption = getOption;
//format the scrapped text element for making the request to the scrapping website
const formatDiscount = (discount) => {
    let formatDis = discount.toString().toLowerCase();
    formatDis = formatDis.replace(/&/g, "and");
    formatDis = formatDis.replace(/%/g, "percent");
    formatDis = formatDis.replace(/\+/g, "%2B");
    formatDis = formatDis.trim();
    formatDis = formatDis.replace(/\s{1,}/g, "-");
    return formatDis;
};
exports.formatDiscount = formatDiscount;
//format the scrapped expiry date for making the request to the scrapping website
const formatDate = (date) => {
    if (!date)
        return null;
    const d = new Date(+date);
    let curr_date = d.getDate().toLocaleString();
    let curr_month = (d.getMonth() + 1).toString(); //Months are zero based
    let curr_year = d.getFullYear();
    if (curr_date.length < 2)
        curr_date = "0" + curr_date;
    if (curr_month.length < 2)
        curr_month = "0" + curr_month;
    let fullDate = (curr_year + "-" + curr_month + "-" + curr_date);
    if (curr_year < 2005) {
        return null;
    }
    return fullDate;
};
exports.formatDate = formatDate;
const formatDescription = (description) => {
    if (!description)
        return null;
    let formdesc = description.toString();
    formdesc = formdesc.replace(/<br>/g, "&#13");
    formdesc = formdesc.replace(/<\/li>/g, "&#13");
    return formdesc;
};
exports.formatDescription = formatDescription;
