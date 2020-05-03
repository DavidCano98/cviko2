const day = 60*60*24*1000;


function processData(event) {
    let feedbackList=[];
    const formElement=document.getElementById("rating");


    if(localStorage.storedFeedbacks){
        feedbackList=JSON.parse(localStorage.storedFeedbacks);
    }

    event.preventDefault();

    let formElements = document.forms[0].elements;

    const Name = formElements["name"].value.trim();
    const Email = formElements["email"].value.trim();
    const ImgURL = formElements["pic_url"].value.trim();
    const CheckedRadio = formElements["rola"].value;
    const CheckedCheckboxes = checkedBoxesFromField(formElements["zaujem"]);
    const Keyword = formElements["keyword"].value.trim();
    const Comment = formElements["feedback"].value.trim();

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

    console.log("Feedbacke added");
    console.log("Current feeddbacks are:");
    console.log(feedbackList);

    formElement.reset();

    window.location.hash="#opinions";
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
    let feedbackList =[];

    if(localStorage.storedFeedbacks){
        feedbackList=JSON.parse(localStorage.storedFeedbacks);
    }

    let i = 0;

    for (const feedback of feedbackList) {
        if ((Date.now() - new Date(feedback.created)) / (day) > 1) {
            feedbackList.pop(feedback);
            i++;
        }
    }

    if (i > 0) {
        console.log("Removed " + i + "submissions");
        localStorage.storedFeedbacks = JSON.stringify(feedbackList);
    } else {
        console.log("Nothing to remove");
    }
}

