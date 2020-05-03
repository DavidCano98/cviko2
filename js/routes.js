//an array, defining the routes

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const perPage = 20;
let total = 0;


export default [
    {
        //the part after '#' in the url (so-called fragment):
        hash: "welcome",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },

    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles
    },

    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions
    },

    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML
            fillOutForms();
        }
    },

    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addArticle").innerHTML;
            fillOutForms();
        }
    },

    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },


    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },

    {
        hash: "profile",
        target: "router-view",
        getTemplate: updateSignIn

    },

];

function addArtDetailLink2ResponseJson(responseJSON) {
    responseJSON.articles =
        responseJSON.articles.map(
            article => (
                {
                    ...article,
                    detailLink: `#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
                }
            )
        );
}


function createHtml4opinions(targetElm) {

    const feebacksList = localStorage.storedFeedbacks;

    let opinions = [];

    if (feebacksList) {
        opinions = JSON.parse(feebacksList);
    }

    console.log(opinions);

    opinions.forEach(opinion => {
        opinion.created = (new Date(opinion.created)).toDateString();
        opinion.interest = opinion.interest.length === 0 ? "Neuvedené" : opinion.interest;
    });

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}


function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash) {


    let offset = Number(offsetFromHash);

    if (isNaN(offset)) {
        offset = 0;
    }

    let articleList = [];

    let urlQuery = "";


    if (offset) {
        urlQuery = `?&offset=${offset}&max=${perPage}`;
    } else {
        urlQuery = `?$&max=${perPage}`;
    }

    const url = `${urlBase}/article${urlQuery}`;
    const content_url = "https://wt.kpi.fei.tuke.sk/api/article";

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Could not load articles. Server answered with ${response.status}: ${response.statusText}.`))
            }
        })
        .then(responseJSON => {
            addArtDetailLink2ResponseJson(responseJSON);
            articleList = responseJSON.articles;
            total = responseJSON.meta.totalCount;
            console.log(total);
        })
        .then(() => {
            console.log("fetching contents");

            let cntRequests = articleList.map(
                article => fetch(`${content_url}/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses => {
            console.log("checking promises");

            let failed = "";
            for (let response of responses) {
                if (!response.ok) failed += response.url + " ";
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => {
            return Promise.all(responses.map(resp => resp.json()))
        })
        .then(articles => {
            articles.forEach((article, index) => {
                articleList[index].content = article.content;
            });


            return Promise.resolve();
        })
        .then(() => {
            renderArticles(articleList, targetElm, offset)
        })
        .catch(error => {
            console.error(error)
        });
}

function renderArticles(articles, target, offset) {
    const max = Math.min(offset + perPage, total);

    articles.total = total;
    articles.min = offset + 1;
    articles.max = max;
    articles.nextOffset = max;
    articles.prevOffset = Math.max(offset - perPage, 0);
    articles.perPage = perPage;


    document.getElementById(target).innerHTML = Mustache.render(
        document.getElementById("template-articles").innerHTML, articles);

    console.log(document.getElementById("backButton"));

    if (offset - perPage < 0) {
        document.getElementById("backButton").classList.toggle("hidden");
    } else {
        document.getElementById("backButton").classList.remove("hidden");
    }

    if (offset + perPage >= total) {
        document.getElementById("nextButton").classList.toggle("hidden");
    } else {
        document.getElementById("nextButton").classList.remove("hidden");
    }
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, false);
}


function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments, true);
}

function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const offset = Number(offsetFromHash);
    const totalCount = Number(totalCountFromHash);

    const url = `${urlBase}/article/${artIdFromHash}`;


    const verification = window.confirm("Are you sure you want to delete?");
    if (!verification) {
        window.location.hash = `#article/${artIdFromHash}/${offset}/${totalCount}`;
        return;
    }

    const deleteReqSettings =
        {
            method: 'DELETE'
        };

    fetch(url, deleteReqSettings)
        .then(response => {
            if (!response.ok) {
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .catch(error => {
            console.error("delete failed")
        })
        .finally(() => {
            window.location.hash = `#articles/${{offset}}`;
        });
}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {

            if (forEdit) {
                responseJSON.formTitle = "Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle = "Save article";
                responseJSON.urlBase = urlBase;

                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;


                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );

            } else {

                responseJSON.backLink = `#articles/${offsetFromHash}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        responseJSON
                    );
            }


        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });

}

