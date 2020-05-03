let feedbackList=[];
const formElement=document.getElementById("rating");
const feedbacksElmement=document.getElementById("FeedbackContainer");
const day = 60*60*24*1000;

if(localStorage.storedFeedbacks){
    feedbackList=JSON.parse(localStorage.storedFeedbacks);
}

formElement.addEventListener("submit", processData);
formElement.addEventListener("submit", notifyUser);
formElement.addEventListener("reset", function () {
    document.getElementById("form_output").innerHTML = "";
    document.getElementById("form_output").className = "";
});

console.log(feedbackList);
feedbacksElmement.innerHTML=Array2html(feedbackList);

function notifyUser(validity) {
    let output = document.getElementById("form_output");

    if(false){
        output.innerHTML = "Vyplň všetky povinné položky!!!!!";
        output.className="invalid"
        return
    }

    output.innerHTML = "Vďaka!";
    output.className="valid"
}

function Array2html(sourceData){
    let tmp = sourceData.slice().reverse();
    return tmp.reduce((feedbackElement,feedback) => feedbackElement+ feedback2html(feedback),"");
}

function feedback2html(feedback){
    const feedbackView ={
        name: feedback.name,
        comment: feedback.comment,
        createdDate: (new Date(feedback.created)).toDateString(),
        role: feedback.role,
        interest: (feedback.interest.length == 0 ? "nezadané" : feedback.interest),
    };



    const template = document.getElementById("feedbackTemplate").innerHTML;
    let renered = Mustache.to_html(template,feedbackView);

    return renered;
}


function processData(event) {
    event.preventDefault();

    // let formElements = document.forms[0].elements;
    let formElements = formElement.elements;

    const Name = formElements["name"].value.trim();
    const Email = formElements["email"].value.trim();
    const ImgURL = formElements["pic_url"].value.trim();
    const CheckedRadio = formElements["rola"].value;
    const CheckedCheckboxes = checkedBoxesFromField(formElements["zaujem"]);
    const Keyword = formElements["keyword"].value.trim();
    const Comment = formElements["feedback"].value.trim();

    if(Name === "" || Email === "" || Comment === ""){
        notifyUser(false);
        return
    }
    else {
        notifyUser(true)
    }


    const newFeedback = {
        name: Name,
        email: Email,
        imgURL: ImgURL,
        role: CheckedRadio,
        interest: CheckedCheckboxes,
        keyword: Keyword,
        comment: Comment,
        created: new Date()
    };

    feedbackList.push(newFeedback);
    localStorage.storedFeedbacks = JSON.stringify(feedbackList);
    feedbacksElmement.innerHTML = feedback2html(newFeedback) + feedbacksElmement.innerHTML;
    
    console.log("Feedbacke added");
    console.log("Current feeddbacks are:");
    console.log(feedbackList);

    formElement.reset();
}
function checkedBoxesFromField(boxField) {
    let names = [];

    for(const box of boxField){
        if(box.checked){
            names.push(box.value);
        }
    }
    return names;
}


function delete_old_stuff() {
    let i=0;

    for (const feedback of feedbackList){
        if ((Date.now() - new Date(feedback.created))/(day) > 1){
            feedbackList.pop(feedback);
            i++;
        }
    }

    if(i>0){
        console.log("Removed " + i + "submissions");
        localStorage.storedFeedbacks = JSON.stringify(feedbackList);
        feedbacksElmement.innerHTML = Array2html(feedbackList)
    }
    else {
        console.log("Nothing to remove");
    }
}
