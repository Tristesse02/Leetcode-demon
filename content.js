/** ****************************************************** Global Variable Definition ****************************************************** */
let globalElem = [];
const difficultyElem = new Set();
let debounceTimer = null;
let debounceTimerDifficulty = null;
let initialChanges = false;

const observer = new MutationObserver((mutations) => {
  // marking the changes has been applied
  initialChanges = true;

  mutations.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        // if (node.nodeName === "DIV") return;
        if (
          node.matches &&
          (node.matches(".text-yellow, .dark\\:text-dark-yellow") ||
            node.matches(".text-olive, .dark\\:text-dark-olive") ||
            node.matches(".text-pink, .dark\\:text-dark-pink"))
        ) {
          if (node.nodeName === "SPAN") {
            globalElem.push(node);
          }
        } else if (
          node.matches &&
          node.matches(
            ".odd\\:bg-layer-1, .even\\:bg-overlay-1, .dark\\:odd\\:bg-dark-layer-bg, .dark\\:even\\:bg-dark-fill-4"
          )
        ) {
          elem = node.children[4].children[0];
          if (elem.nodeName === "SPAN") {
            globalElem.push(elem);
          }
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          addImgs(globalElem);
          globalElem = [];
        }, 500);
      });
    }
  });
});

const difficultyObserver = new MutationObserver((mutations) => {
  // marking the changes has been applied
  initialChanges = true;

  mutations.forEach((mutation) => {
    if (mutation.type === "characterData") {
      if (mutation.target.textContent.endsWith("%")) {
        const acceptanceRateParent =
          mutation.target.parentElement.parentElement;
        const difficultyContainer = acceptanceRateParent.nextElementSibling;
        difficultyElem.add(difficultyContainer.children[0]);
      } else if (
        mutation.target.textContent.endsWith("Easy") ||
        mutation.target.textContent.endsWith("Medium") ||
        mutation.target.textContent.endsWith("Hard")
      ) {
        difficultyElem.add(mutation.target.parentElement);
      }

      clearTimeout(debounceTimerDifficulty);
      debounceTimerDifficulty = setTimeout(() => {
        replaceImg(difficultyElem);
        difficultyElem.clear();
      }, 500);
    }
    // else if (mutation.type === "attributes") {
    //     if (
    //       mutation.target.matches &&
    //       (mutation.target.matches(".text-yellow, .dark\\:text-dark-yellow") ||
    //         mutation.target.matches(".text-olive, .dark\\:text-dark-olive") ||
    //         mutation.target.matches(".text-pink, .dark\\:text-dark-pink"))
    //     ) {
    //       // console.log("node attributes changes", mutation.target);
    //       difficultyElem.push(mutation.target);
    //     }

    //     clearTimeout(debounceTimerDifficulty);
    //     debounceTimerDifficulty = setTimeout(() => {
    //       replaceImg(difficultyElem);
    //       difficultyElem = [];
    //     }, 500);
    //   }
  });
});

/** ****************************************************** Function Definition ****************************************************** */
const getImageUrl = () => {
  /**
   * @param none
   * @returns {function} - A function that takes an index and returns the URL of the image at that index
   * @description - A function that lazily load the images and help saving in the cache for better runtime
   */
  imgsCache = {};
  const imgsNames = [
    "Unrated.png",
    "Easy.png",
    "Normal.png",
    "Hard.png",
    "Harder.png",
    "Insane.png",
    "EasyDemon.png",
    "MediumDemon.png",
    "Demon.png",
    "InsaneDemon.png",
    "ExtremeDemon.png",
  ];

  return (imgIdx) => {
    if (imgIdx >= imgsNames.length) {
      return null;
    }

    const imgName = imgsNames[imgIdx];
    if (!(imgName in imgsCache)) {
      imgsCache[imgName] = chrome.runtime.getURL(`images/${imgName}`);
    }

    return imgsCache[imgName];
  };
};

const evaluateDifficulty = (divElem) => {
  /**
   * @param {Element} divElem - The element that contains the difficulty tag
   * @returns {String} - The difficulty of the level
   *
   */
  let acceptanceRateStr =
    divElem.previousElementSibling.children[0].textContent;
  const acceptanceRateVal = Number(
    acceptanceRateStr.substring(0, acceptanceRateStr.length - 2)
  );
  const difficultyElem = divElem.children[0];
  difficultyElem.classList.add("difficulty-tag");
  const img = divElem.children[1];
  const imgUrl = getImageUrl();

  // Error handler:
  if (!img || !difficultyElem) {
    return;
  }

  if (difficultyElem.textContent === "Easy") {
    if (acceptanceRateVal > 75) {
      img.src = imgUrl(1);
    } else if (acceptanceRateVal > 45) {
      img.src = imgUrl(2);
    } else {
      img.src = imgUrl(3);
    }
  } else if (difficultyElem.textContent === "Medium") {
    if (acceptanceRateVal > 85) {
      img.src = imgUrl(4);
    } else if (acceptanceRateVal > 65) {
      img.src = imgUrl(5);
    } else if (acceptanceRateVal > 45) {
      img.src = imgUrl(6);
    } else {
      img.src = imgUrl(7);
    }
  } else if (difficultyElem.textContent === "Hard") {
    if (acceptanceRateVal > 85) {
      img.src = imgUrl(8);
    } else if (acceptanceRateVal > 65) {
      img.src = imgUrl(9);
    } else if (acceptanceRateVal > 45) {
      img.src = imgUrl(10);
    } else {
      img.src = imgUrl(10);
    }
  }
};

const getDifficultyContainerAndModify = () => {
  /**
   * @param none
   * @returns {Element} - The element that contains the difficulty tag
   *
   */
  const tabularWrapperElem = document.getElementsByClassName(
    "inline-block min-w-full"
  )[0];

  if (!tabularWrapperElem) {
    console.error("Tabular wrapper element not found.");
    return;
  }

  const tabularContainerElem = tabularWrapperElem.children[1];
  addImgs(
    Array.from(tabularContainerElem.children).map(
      (e) => e.children[4].getElementsByTagName("span")[0]
    )
  );
};

const addImgs = (tags) => {
  /**
   * @param {Array} tags - An array of elements that contain html elements
   * @returns {void}
   *
   */
  // Disconnect observer?? temporarily
  difficultyObserver.disconnect();

  tags.forEach((tag) => {
    const parentElem = tag.parentElement;

    if (!parentElem || parentElem.children.length > 1) {
      // If the image is already added, return
      return;
    }

    // initialize image element
    const img = document.createElement("img");
    img.className = "icon";

    const span = parentElem.getElementsByTagName("span")[0];
    parentElem.appendChild(img);

    evaluateDifficulty(parentElem);
  });

  difficultyObserver.observe(
    document.getElementsByClassName("inline-block min-w-full")[0],
    { childList: true, subtree: true, attributes: true, characterData: true }
  );
  clearTimeout(debounceTimer);
};

const replaceImg = (tags) => {
  // console.log("vl bn oi");
  /**
   * @param {Array} tags - An array of elements that contain html elements
   * @returns {void}
   *
   */
  // Disconnect observer?? temporarily
  observer.disconnect();

  for (let tag of tags) {
    const parentElem = tag.parentElement;

    if (!parentElem) {
      return;
    }

    evaluateDifficulty(parentElem);
  }

  observer.observe(
    document.getElementsByClassName("inline-block min-w-full")[0],
    { childList: true, subtree: true, attributes: true }
  );
};

/** ************************************************************ On Runtime ************************************************************ */
document.addEventListener("DOMContentLoaded", () => {
  const link = document.createElement("link");
  link.href = chrome.runtime.getURL("styles.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
});

window.onload = async () => {
  const tabularWrapperElem = document.getElementsByClassName(
    "inline-block min-w-full"
  )[0];

  if (!tabularWrapperElem) {
    console.error("Tabular wrapper element not found.");
    return;
  }

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  difficultyObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
};

window.addEventListener("popstate", function (event) {
  this.setTimeout(() => {
    getDifficultyContainerAndModify();
  }, 1000);
});

/** ************************************************************ Event Listener ************************************************************ */

// console.log(
//   "minhdz",
//   document.querySelectorAll(
//     ".mx\\-2 py\\-[11px] font\\-normal text\\-label\\-3 dark\\:text\\-dark\\-label\\-3 hover\\:text\\-gray\\-7 dark\\:hover\\:text\\-dark\\-gray\\-7 group"
//   )
// );

// // content.js Laufey part
// console.log("Content script loaded");

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.greeting === "hello") {
//     console.log("Received hello from background script");
//     replaceImages();

//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.addedNodes.length > 0) {
//           replaceImages();
//         }
//       });
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
//     sendResponse({ farewell: "Goodbye from content script!" });
//   }
// });
