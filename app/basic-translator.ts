import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const basicTranslator = () => `{
    "translatorID": "${crypto.randomUUID()}",
    "label": "",
    "creator": "",
    "target": "",
    "minVersion": "3.0",
    "maxVersion": "",
    "priority": 100,
    "inRepository": true,
    "translatorType": 4,
    "browserSupport": "gcsibv",
    "lastUpdated": "${dayjs.utc().format('YYYY-MM-DD HH:mm:ss')}"
}

function detectWeb(doc, url) {
    const contentType = attr(doc, 'meta[property="og:type"]', 'content');

    if (contentType === 'article') {
        return 'newspaperArticle';
    }

    return false;
}

function doWeb(doc, url) {
    const translator = Zotero.loadTranslator('web');

    // Embedded Metadata
    translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
    translator.setDocument(doc);

    translator.setHandler('itemDone', (obj, item) => {
        item.itemType = detectWeb(doc, url);

        // Additional configs for item object

        item.complete();
    });

    translator.getTranslatorObject((trans) => {
        trans.doWeb(doc, url);
    });
}

/** BEGIN TEST CASES **/
var testCases = [
    {
        "type": "web",
        "url": "",
        "items": [
            {

            }
        ]
    }
]
/** END TEST CASES **/
`;
