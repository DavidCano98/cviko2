let auth2 = {};

function renderUserInfo(googleUser, htmlElmId) {
    const data = getUserInfo(googleUser);
    const template = document.getElementById("template-login-info").innerHTML;

    if (template && data) {
        document.getElementById(htmlElmId).innerHTML = Mustache.render(template, data);
    }
}

function getUserInfo(googleUser) {
    const profile = googleUser.getBasicProfile();

    if (profile) return {
        ID: profile.getId(),
        FullName: profile.getName(),
        FirstName: profile.getGivenName(),
        LastName: profile.getFamilyName(),
        ImgURL: profile.getImageUrl(),
        Email: profile.getEmail()
    }
}

function renderLogOutInfo(htmlElmId) {
    document.getElementById(htmlElmId).innerHTML = `
                <p style="color: red">Pužívateľ nie je prihlásený</p>
                `;
}

function signOut() {
    if (auth2.signOut) auth2.signOut();
    if (auth2.disconnect) auth2.disconnect();


    updateSignIn("router-view")
}

function userChanged() {
    var userInfoElm = document.getElementById("router-view");

    fillOutForms();
    if (userInfoElm) {// pre/for 82GoogleAccessBetter.html
        updateSignIn("router-view");
    }
}


var updateSignIn = function () {
    let buttonSignOut = document.getElementById("signOutButton");

    var sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hidden");
        if (buttonSignOut) {
            document.getElementById("signOutButton").classList.remove("hidden")
        }
    } else {
        document.getElementById("SignInButton").classList.remove("hidden");
        if (buttonSignOut) {
            document.getElementById("signOutButton").classList.add("hidden")
        }
    }


    if (location.hash === "#profile") {
        if (sgnd) {
            renderUserInfo(auth2.currentUser.get(), "router-view");

        } else {
            renderLogOutInfo("router-view");
        }
    }
};

function startGSingIn() {
    gapi.load('auth2', function () {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializĂˇcii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function () {
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}

function onFailure(error) {
    console.log(error);
}

function fillOutForms() {
    let data = getUserInfo(auth2.currentUser.get());

    let AuthorElements = document.getElementsByClassName("Author");
    let EmailElements = document.getElementsByClassName("Email");
    let i;

    for (i=0; i<AuthorElements.length; i++) {
        if (auth2.isSignedIn.get()) {
            AuthorElements[i].value = data.FullName;
        }
        else {
            AuthorElements[i].value = "";
        }
    }

    for (i=0; i<EmailElements.length; i++) {
        if (auth2.isSignedIn.get()) {
            EmailElements[i].value = data.Email;
        }
        else {
            EmailElements[i].value = "";
        }
    }
}