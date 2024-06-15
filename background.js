// background.js
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the tab is completely loaded before sending the message
    if (changeInfo.status === 'complete' && tab.active) {
        sendMessageToContentScript(tabId);
    }
});

function sendMessageToContentScript(tabId) {
    chrome.tabs.sendMessage(tabId, { greeting: "hello" }, function(response) {
        if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
            return;
        }
        console.log("Response from content:", response);
    });
}

// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
// 	var activeTab = tabs[0];
// 	var activeTabId = activeTab.id; // This is the active tab ID
// 	console.log("tabs: ", tabs);
// 	console.log("Active Tab ID: ", activeTabId);

// 	// You can perform other actions with the activeTabId here
//   });

// chrome.tabs.query({}, (tabs) => {
//   const lc = tabs.filter((e) => {
//     const url = new URL(e.url);
//     return url.hostname === "leetcode.com";
//   });
//   console.log(lc);
//   chrome.tabs.sendMessage(
//     lc[0].id,
//     { greeting: "Hello from background!" },
//     function (response) {
//       console.log("Response from content script:", response);
//     }
//   );
// });

//   chrome.runtime.sendMessage(lc[0].id, { action: "modifyContent" });
//   lc.forEach((tab) => {
//     chrome.tabs.sendMessage(tab.id, { action: "modifyContent" });
//   });
