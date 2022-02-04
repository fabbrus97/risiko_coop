function update_table(data){
    /*
    formato dei dati:
    [{
        "id": "1234"
        "name": "lobby 1"
        "numero_giocatori": 4
        "giocatori_massimi": 5
        "password": false
    }]
    */

    $("#table tbody").empty();

    if (data.length == 10){
        $("#newlobby").html(`
        <div class="alert alert-warning" role="alert">
            Numero lobby massime raggiunto!
        </div>`)
    }
    tabella = $("#table tbody")
    data.forEach(e => {
        let sicurezza = "aperta"
        if (e["password"]){
            sicurezza = "<span style='color:red'> <b> password </b> </span>"
        }
        tabella.append(`<tr id="${e["id"]}"><td> ${e["name"]} </td><td> ${e["numero_giocatori"]} </td><td> ${e["giocatori_massimi"]} </td><td> ${sicurezza} </td>
                        <td><a href="#" onclick="joinLobby(event, ${sicurezza == "aperta"}, '${e["name"]}', ${e["giocatori_massimi"]} )"> entra </a></td></tr>`)
    });
    
}

/* fetch("http://localhost:3000/lobby")
.then(response => response.json())
  .then(data => {
    update_table(data)
}); */

var socket = io();
socket.on("lobbylist", function(msg){
    update_table(msg)
})

$("#newlobby").submit(function(e){
    socket.emit("newlobby", {"name": e.target[0].value, "maxplayer": e.target[1].value, "password": e.target[2].value})
    
    return false;
});

function joinLobby(e, no_security, nome, giocatori){
    e.preventDefault()
    if (localStorage.getItem(nome)){
        window.location = "/lobby?name="+nome
    }
    if (!localStorage.getItem(nome))
        localStorage.setItem(nome, JSON.stringify({"n_giocatori": giocatori, "password": !no_security}))
    if(no_security)
        window.location = "/lobby?name="+nome
    else
        window.location = "/html/login.html?name=" + nome
}