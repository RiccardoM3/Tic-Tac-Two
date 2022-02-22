var socket = io();

game_capsules = [
    [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}],
    [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}],
    [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}]
];

team_capsules = {
    "red" : [{level: 1, team: "red"}, {level: 2, team: "red"}, {level: 3, team: "red"}, {level: 4, team: "red"}, {level: 5, team: "red"}, {level: 6, team: "red"}],
    "blue" : [{level: 1, team: "blue"}, {level: 2, team: "blue"}, {level: 3, team: "blue"}, {level: 4, team: "blue"}, {level: 5, team: "blue"}, {level: 6, team: "blue"}]
}

game_status = 'waiting';
spectating = false;
team = null;
opposite_team = null;
current_turn = null;

let updateGame = () => {
    let board_elements = document.querySelectorAll(".board .capsule");
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            board_elements[3*i + j].className = "capsule capsule-size-" + game_capsules[i][j].level + " capsule-" + game_capsules[i][j].team;
        }
    }

    let my_elements = document.querySelectorAll(".my_capsules .capsule");
    for (var i = 0; i < 6; i++) {
        my_elements[i].className = "capsule capsule-size-" + team_capsules[team][i].level + " capsule-" + team_capsules[team][i].team;
    }

    let their_elements = document.querySelectorAll(".their_capsules .capsule");
    for (var i = 0; i < 6; i++) {
        their_elements[i].className = "capsule capsule-size-" + team_capsules[opposite_team][i].level + " capsule-" + team_capsules[opposite_team][i].team;
    }

    $('#status-text').html(game_status);
    $('#turn-text').html(current_turn);
}

let resetGame = () => {
    game_capsules = [
        [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}],
        [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}],
        [{level: 0, team: null}, {level: 0, team: null}, {level: 0, team: null}]
    ];

    team_capsules["red"] = [{level: 1, team: "red"}, {level: 2, team: "red"}, {level: 3, team: "red"}, {level: 4, team: "red"}, {level: 5, team: "red"}, {level: 6, team: "red"}];
    team_capsules["blue"] = [{level: 1, team: "blue"}, {level: 2, team: "blue"}, {level: 3, team: "blue"}, {level: 4, team: "blue"}, {level: 5, team: "blue"}, {level: 6, team: "blue"}];

    updateGame();
}

$(".my_capsules .grid-item").on('click', (e) => {

    if (spectating) {
        return;
    }

    if (!$(e.target).find('.capsule').hasClass('capsule-size-0')) {
        $('.selected').removeClass('selected');
        $(e.target).addClass("selected");
    }
})

$(".board .grid-item").on('click', (e) => {

    if (spectating || game_status != "in_progress" || current_turn != team) {
        return;
    }

    if ($('.selected').length > 0) {
        selected_capsule_class = $(".selected .capsule")[0].classList[1];
        selected_capsule_index = selected_capsule_class[selected_capsule_class.length-1] - 1;
        
        //check that capsule actually exists
        if (selected_capsule_index >= 0 && team_capsules[team][selected_capsule_index].level != 0) {

            //check that capsule can be played in the position
            my_capsule = team_capsules[team][selected_capsule_index];
            game_capsule = game_capsules[$(e.target).data('row')][$(e.target).data('col')];
            if (my_capsule.level > game_capsule.level && my_capsule.team != game_capsule.team) {

                socket.emit('action', {
                    team: my_capsule.team,
                    level: my_capsule.level,
                    row: $(e.target).data('row'),
                    col: $(e.target).data('col')
                });
            }
        }
    }
})

socket.on('assign-team', (assigned_team) => {
    
    if (assigned_team == "spectator") {
        team = "red";
        opposite_team = "blue";
        spectating = true;
    } else {
        team = assigned_team;
        opposite_team = team == "red" ? "blue" : "red";
    }
    
    updateGame();

    $('#team-text').html(spectating ? "spectator" : team);
})

socket.on('action', (data) => {
    game_capsules[data.row][data.col].level = data.level;
    game_capsules[data.row][data.col].team = data.team;

    team_capsules[data.team][data.level-1].level = 0;
    team_capsules[data.team][data.level-1].team = null;

    if (data.team == team) {
        $('.selected').removeClass('selected');
    }
    
    current_turn = data.current_turn;
    updateGame();
})

socket.on('start', (data) => {
    console.log('start')
    game_status = 'in_progress';
    current_turn = data.current_turn
    updateGame()
})

socket.on('reset', () => {
    console.log('reset')
    game_status = 'waiting';
    resetGame();
    updateGame();
})