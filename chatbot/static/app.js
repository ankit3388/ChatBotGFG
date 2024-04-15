var lastUserMessage = "";
function provideFeedback(feedback) {
  if (feedback === "yes") {
    return (lastUserMessage = "yes");
  } else if (feedback === "no") {
    return (lastUserMessage = "no");
  }
}

function hideOrshow() {
    console.log("hideOrshow");
    var chatBox = document.querySelector(".chatbox__support");
    chatBox.classList.remove("chatbox--active");
    return;
}

function getFormattedTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding leading zero if necessary
  const day = String(date.getDate()).padStart(2, "0"); // Adding leading zero if necessary
  const hours = String(date.getHours()).padStart(2, "0"); // Adding leading zero if necessary
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Adding leading zero if necessary
  const seconds = String(date.getSeconds()).padStart(2, "0"); // Adding leading zero if necessary
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function downloadFile() {
  // Make API request to download file
  const filename = `chat_transcripts_${getFormattedTimestamp()}.xlsx`;
  console.log("Downloading file...");
  fetch("/download", {
    method: "GET",
  })
    .then((response) => {
      // Check if response is successful
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Return response body as blob
      return response.blob();
    })
    .then((blob) => {
      // Create a URL for the blob data
      const url = window.URL.createObjectURL(blob);
      // Create a temporary link element
      const link = document.createElement("a");
      // Set link's href to the blob URL
      link.href = url;
      // Set link's download attribute with desired file name
      link.setAttribute("download", filename);
      // Append link to the document body
      document.body.appendChild(link);
      // Programmatically click the link to trigger download
      link.click();
      // Remove the link from the document
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}
function download() {
  const downloadButton = document.getElementById("downloadButton");
  downloadButton.addEventListener("click", downloadFile);
}

function redirectToContactPage() {
  // Redirect to the contact page
  window.open("https://www.geeksforgeeks.org/about/contact-us/", "_blank");
}

class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };
    this.state = false;
    this.messages = [];
  }

  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener("click", () => this.toggleState(chatBox));

    sendButton.addEventListener("click", () => this.onSendButton(chatBox));

    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox);
      }
    });
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add("chatbox--active");
    } else {
      chatbox.classList.remove("chatbox--active");
    }
  }

  onSendButton(chatbox) {
    var textField = chatbox.querySelector("input");
    let text1 = textField.value;
    if (text1 === "") {
      return;
    }

    let msg1 = { name: "User", message: text1 };
    this.messages.push(msg1);
    console.log(msg1);
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: JSON.stringify({ message: text1 }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r) => {
        let msg2 = { name: "Sam", message: r.answer };
        this.messages.push(msg2);
        console.log(msg2.message);

        this.updateChatText(chatbox);
        textField.value = "";
      })
      .catch((error) => {
        console.error("Error:", error);
        this.updateChatText(chatbox);
        textField.value = "";
      });
  }
  updateChatText(chatbox) {
    var html = "";
    this.messages
      .slice()
      .reverse()
      .forEach(function (item, index) {
        if (item.name === "Sam") {
          if (
            item.message === "Thanks for chatting with me. Have a great day!"
          ) {
            // alert(" Rates us, Are you Satisfied ?? 'yes' or 'no'");
            html =
              '<div class="messages__item messages__item--visitor"</div>' +
              "<p> Are you satisfied ? </p>" +
              '<button class="feedback-button yes-button" onclick="hideOrshow()">Yes</button>' +
              '<button class="feedback-button no-button" onclick="redirectToContactPage()">No</button>' +
              "</div>";
            console.log(lastUserMessage);
            // document.getElementById('feedback-container').innerHTML += html;
            // return;
          }
          // html += '<div class="Satisfied">' + item.message + '</div>'
          html +=
            '<div class="messages__item messages__item--visitor">' +
            item.message +
            "</div>";
        } else {
          html +=
            '<div class="messages__item messages__item--operator">' +
            item.message +
            "</div>";
        }
      });
    console.log(lastUserMessage);
    const chatmessage = chatbox.querySelector(".chatbox__messages");
    if (lastUserMessage.toLowerCase() === "yes") {
      chatmessage.innerHTML +=
        '<div class="messages__item messages__item--operator">Thanks!</div>';
    }
    chatmessage.innerHTML = html;
  }
}
const chatbox = new Chatbox();
chatbox.display();
