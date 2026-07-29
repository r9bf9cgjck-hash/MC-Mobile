// ===========================
// MC MOBILE
// players.js
// ===========================

// Игроки

const PLAYERS = [

{
    id:1,
    name:"Хабиб",
    number:7,
    team:"FC Masters",
    careerRating:60,
    quickRating:90,
    defaultPosition:"GK",
    divisionChosen:false,

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
},

{
    id:2,
    name:"Азиз",
    number:10,
    team:"FC Masters",
    careerRating:60,
    quickRating:90,
    defaultPosition:"ST",

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
},

{
    id:3,
    name:"Абдул",
    number:1,
    team:"FC Masters",
    careerRating:60,
    quickRating:90,
    defaultPosition:"GK3",

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
},

{
    id:4,
    name:"Шамиль",
    number:9,
    team:"Real Shamil",
    careerRating:60,
    quickRating:90,
    defaultPosition:"ST",

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
},

{
    id:5,
    name:"Шамиль Jr",
    number:11,
    team:"Real Shamil",
    careerRating:60,
    quickRating:90,
    defaultPosition:"GK",

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
},

{
    id:6,
    name:"Салаудин",
    number:13,
    team:"Real Shamil",
    careerRating:60,
    quickRating:90,
    defaultPosition:"GK3",

    stats:{
        matches:0,
        wins:0,
        losses:0,
        goals:0,
        assists:0
    }
}

];

// ----------------------------

let selectedCareerPlayer=null;

let selectedDivisionPlayer=null;

// ----------------------------

function getPlayer(id){

    return PLAYERS.find(player=>player.id===id);

}

// ----------------------------

function saveCareerPlayer(id){

    localStorage.setItem(
        "careerPlayer",
        id
    );

    selectedCareerPlayer=id;

}

// ----------------------------

function loadCareerPlayer(){

    const id=localStorage.getItem(
        "careerPlayer"
    );

    if(id){

        selectedCareerPlayer=parseInt(id);

    }

}

// ----------------------------

function saveDivisionPlayer(id){

    if(
        localStorage.getItem(
            "divisionPlayer"
        )
    ){

        return false;

    }

    localStorage.setItem(
        "divisionPlayer",
        id
    );

    selectedDivisionPlayer=id;

    return true;

}

// ----------------------------

function loadDivisionPlayer(){

    const id=
    localStorage.getItem(
        "divisionPlayer"
    );

    if(id){

        selectedDivisionPlayer=
        parseInt(id);

    }

}

// ----------------------------

// Загрузка сохранений

loadCareerPlayer();

loadDivisionPlayer();
