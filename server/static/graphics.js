function start_putting_tanks(nations){

    var tank_counter_setter = `
        <div class="tank_setter">
            <span class="minus"> <img src="images/minus.png" onclick="remove_tank(this)"> </span> 
            <span class="tank_img"> <img src="images/red_army.png"> </span> 
            <span class="tank_ctr"> x 1 </span> 
            <span class="plus"> <img src="images/plus.png" onclick="add_tank(this)"> </span> 
        </div>
    `

    nations.forEach(element => {
        $(`#${element}`).append(tank_counter_setter)
    });

    alert("Puoi cominciare a disporre le armate!!!!")
}

function add_tank(element){
    var state = element.parentElement.parentElement.parentElement.id
    var n = element.parentElement.parentElement.childNodes[5].textContent.replace("x", "").trim()
    n = parseInt(n)
    if (window.gs.me().getTanks() > 0){
        n += 1
        element.parentElement.parentElement.childNodes[5].textContent = ` x ${n}`
        window.gs.me().addTanks(state, 1)
        updateTanksCounter(window.gs.me().getTanks())
    }
}

function remove_tank(element){
    var state = element.parentElement.parentElement.parentElement.id
    var n = element.parentElement.parentElement.childNodes[5].textContent.replace("x", "").trim()
    n = parseInt(n)
    if (n>1){
        n -= 1
        element.parentElement.parentElement.childNodes[5].textContent = ` x ${n}`
        window.gs.me().removeTanks(state, 1, true)
        updateTanksCounter(window.gs.me().getTanks())
        
    }
}

function updateTanksCounter(n){
    $("#tank_counter_dashboard").text(n)
}

function next(){
    window.gs.next();
}

function your_turn(){
    // aggiorna status - carri nemici, abilita/disabilita bottoni...
    alert("è il tuo turno!")
}