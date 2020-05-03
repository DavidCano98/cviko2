
function makeArticle(event) {
    const formElement=document.getElementById("articleAdder");
    const url = "https://wt.kpi.fei.tuke.sk/api/article";

    formElement.addEventListener("submit", makeArticle);

    event.preventDefault();

    const title = formElement["title"].value.trim();
    const content = formElement["content"].value.trim();
    const link = formElement["link"].value.trim();
    const author = formElement["author"].value.trim();
    const tags = formElement["tags"].value.trim();

    const data = {
        title:title,
        content:content,
        link: link,
        author: author,
        tags:tags
    };

    const postReqSettings =
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(data)
        };


    fetch(url, postReqSettings)
        .then(response => {
            if (response.ok){
                console.log("articled added yay");
            }
            else {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error =>{
            window.alert(`Failed to save the updated article on server. ${error}`);
        })
        .finally(()=>{
            window.location.hash="#articles/0";
        });
}


