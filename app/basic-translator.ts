export const basicTranslator = `{
\t"translatorID": "92d45016-5f7b-4bcf-bb63-193033f02f2b",
\t"label": "ABC News Australia",
\t"creator": "Joyce Chia",
\t"target": "https?://(www\\\\.)?abc\\\\.net\\\\.au/news/",
\t"minVersion": "3.0",
\t"maxVersion": "",
\t"priority": 100,
\t"inRepository": true,
\t"translatorType": 4,
\t"browserSupport": "gcsibv",
\t"lastUpdated": "2021-07-23 00:29:10"
}

/* {{LICENSE_BLOCK}} */

function detectWeb(doc, _url) {
\tlet contentType = attr(doc, 'meta[property="ABC.ContentType"]', 'content');
\tif (contentType == 'CMChannel' && getSearchResults(doc, true)) {
\t\treturn 'multiple';
\t}
\telse if (contentType == 'Video') {
\t\treturn 'videoRecording';
\t}
\telse if (contentType == 'Article') {
\t\treturn 'newspaperArticle';
\t}
\treturn false;
}

function getSearchResults(doc, checkOnly) {
\tvar items = {};
\tvar found = false;
\tvar rows = doc.querySelectorAll('h3 a');
\tfor (var i = 0; i < rows.length; i++) {
\t\tvar href = rows[i].href;
\t\tvar title = ZU.trimInternal(rows[i].textContent);
\t\tif (!href || !title) continue;
\t\tif (checkOnly) return true;
\t\tfound = true;
\t\titems[href] = title;
\t}
\treturn found ? items : false;
}

function doWeb(doc, url) {
\tif (detectWeb(doc, url) == "multiple") {
\t\tZotero.selectItems(getSearchResults(doc, false), function (items) {
\t\t\tif (!items) return;
\t\t\tZU.processDocuments(Object.keys(items), scrape);
\t\t});
\t}
\telse {
\t\tscrape(doc, url);
\t}
}

function scrape(doc, url) {
\tvar translator = Zotero.loadTranslator('web');
\t// Embedded Metadata
\ttranslator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
\ttranslator.setDocument(doc);
\t
\ttranslator.setHandler('itemDone', function (obj, item) {
\t\titem.language = "en-AU";
\t\t// og:url does not preserve https prefixes, so use canonical link until fixed
\t\tvar canonical = doc.querySelector('link[rel="canonical"]');
\t\tif (canonical) {
\t\t\titem.url = canonical.href;
\t\t}
\t\t
\t\tif (item.itemType == 'videoRecording') {
\t\t\titem.studio = "ABC News"; // i guess this is correct...
\t\t}
\t\telse {
\t\t\titem.publicationTitle = "ABC News";
\t\t}
\t\t
\t\titem.language = "en-AU";
\t\t
\t\tif (item.date) {
\t\t\titem.date = ZU.strToISO(item.date);
\t\t}
\t\telse {
\t\t\titem.date = ZU.strToISO(attr(doc, 'time', 'datetime'));
\t\t}
\t\t
\t\tvar authors = text(doc, '[data-component="Byline"] p');
\t\tif (authors && item.creators.length <= 1) {
\t\t\tauthors = authors.replace(/^By /, '');
\t\t\tif (authors == authors.toUpperCase()) { // convert to title case if all caps
\t\t\t\tauthors = ZU.capitalizeTitle(authors, true);
\t\t\t}
\t\t\titem.creators = [];
\t\t\tvar authorsList = authors.split(/,|\\band\\b/);
\t\t\tfor (let i = 0; i < authorsList.length; i++) {
\t\t\t\titem.creators.push(ZU.cleanAuthor(authorsList[i], "author"));
\t\t\t}
\t\t}
\t\t
\t\titem.complete();
\t});

\ttranslator.getTranslatorObject(function (trans) {
\t\ttrans.itemType = detectWeb(doc, url);
\t\ttrans.doWeb(doc, url);
\t});
}

/** BEGIN TEST CASES **/
var testCases = [
\t{
\t\t"type": "web",
\t\t"url": "https://www.abc.net.au/news/2020-05-22/nt-government-coronavirus-recovery-commission-michael-gunner/12276832?section=politics",
\t\t"items": [
\t\t\t{
\t\t\t\t"itemType": "newspaperArticle",
\t\t\t\t"title": "NT 'uniquely positioned' to solve Australia's economic woes post-COVID-19, says Chief Minister",
\t\t\t\t"creators": [
\t\t\t\t\t{
\t\t\t\t\t\t"firstName": "Lauren",
\t\t\t\t\t\t"lastName": "Roberts",
\t\t\t\t\t\t"creatorType": "author"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"date": "2020-05-22",
\t\t\t\t"abstractNote": "The NT Labor Government establishes a new commission to help it financially recover from the coronavirus pandemic, with the former opposition leader and a former chief minister in key roles.",
\t\t\t\t"language": "en-AU",
\t\t\t\t"libraryCatalog": "www.abc.net.au",
\t\t\t\t"publicationTitle": "ABC News",
\t\t\t\t"url": "https://www.abc.net.au/news/2020-05-22/nt-government-coronavirus-recovery-commission-michael-gunner/12276832",
\t\t\t\t"attachments": [
\t\t\t\t\t{
\t\t\t\t\t\t"title": "Snapshot",
\t\t\t\t\t\t"mimeType": "text/html"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"tags": [
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "chief minister michael gunner"
\t\t\t\t\t},
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "coronavirus budget"
\t\t\t\t\t},
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "nt budget"
\t\t\t\t\t},
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "parliament house"
\t\t\t\t\t},
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "territory economic reconstruction commission"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"notes": [],
\t\t\t\t"seeAlso": []
\t\t\t}
\t\t]
\t},
\t{
\t\t"type": "web",
\t\t"url": "https://www.abc.net.au/news/2021-07-23/tracey-holmes-on-the-ground-in-tokyo/13467310",
\t\t"items": [
\t\t\t{
\t\t\t\t"itemType": "videoRecording",
\t\t\t\t"title": "Tracey Holmes on the ground in Tokyo",
\t\t\t\t"creators": [
\t\t\t\t\t{
\t\t\t\t\t\t"firstName": "Tracey",
\t\t\t\t\t\t"lastName": "Holmes",
\t\t\t\t\t\t"creatorType": "author"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"date": "2021-07-22",
\t\t\t\t"abstractNote": "Brisbane is named the host of the 2032 Olympics, Tracey speaks with Federal Sports Minister Richard Colbeck to get his reaction. Plus we look at the COVID safety measures athletes, officials and the media are subjected to as they land in the Japanese capital.",
\t\t\t\t"language": "en-AU",
\t\t\t\t"libraryCatalog": "www.abc.net.au",
\t\t\t\t"studio": "ABC News",
\t\t\t\t"url": "https://www.abc.net.au/news/2021-07-23/tracey-holmes-on-the-ground-in-tokyo/13467310",
\t\t\t\t"attachments": [
\t\t\t\t\t{
\t\t\t\t\t\t"title": "Snapshot",
\t\t\t\t\t\t"mimeType": "text/html"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"tags": [
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "olympics"
\t\t\t\t\t},
\t\t\t\t\t{
\t\t\t\t\t\t"tag": "tokyo olympics 2021"
\t\t\t\t\t}
\t\t\t\t],
\t\t\t\t"notes": [],
\t\t\t\t"seeAlso": []
\t\t\t}
\t\t]
\t}
]
/** END TEST CASES **/`;
