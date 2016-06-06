var team = function(n,fl,r) {
    this.name = n;
    this.flag = fl;
    this.group = null;
    this.rank = r || 100;
};

var match = function(teamA,teamB,date) {
    this.teamA = teamA || {name:""};
    this.teamB = teamB || {name:""};
    this.date = date || new Date();
    this.score = {
        teamA: 0,
        teamB: 0
    };

    this.addScore = function(score1,score2){
        this.score.teamA = score1;
        this.score.teamB = score2;
    };
}

var group = function(n) {
    var self = this;
    this.name = n;
    this.teams = [];
    this.matches= [];

    this.addTeam = function(t) {
        // Add some attributes to the team.
        t.matches = 0;
        t.group = this.name;
        t.points = 0;
        t.goalsFor = 0;
        t.goalsAgainst = 0;
        // Add the team to the groups team array
        this.teams.push(t);
    };

    this.addMatch = function(match) {
        self.matches.push(match)
    };

    this.addScore = function(match,score1,score2) {
        match.addScore(score1,score2);
        if(score1 > score2) {
            match.teamA.points += 3;
        } else if(score2 > score1) {
            match.teamB.points += 3;
        } else {
            match.teamA.points += 1;
            match.teamB.points += 1;
        }

        // Add some match stats
        match.teamA.matches += 1;
        match.teamB.matches += 1;

        match.teamA.goalsFor += score1;
        match.teamA.goalsAgainst += score2;

        match.teamB.goalsFor += score2;
        match.teamB.goalsAgainst += score1;


    };

    //
    // Sort the teams in order by the UEFA standards.
    //
    //  1. Higher number of points obtained in the group matches played among the teams in question.
    //  2. Superior goal difference from the group matches played among the teams in question
    //  3. Goal Difference
    //  4. .....
    //
    this.orderGroup = function(m) {

        var sortByM = m ? false : true;
        var oldOrder = this.teams;
        var match,gDifference,mostGoals;



        this.teams.sort(function(a,b){
          var samePointTeams = [];
              var counts = {};
              for(var i = 0; i< self.teams.length; i++) {
                  var num = self.teams[i].points;
                  if(counts.hasOwnProperty(num)) {
                    counts[num].push(self.teams[i]);
                  } else {
                    counts[num] = [self.teams[i]];
                  }
              }
              for (var p in counts) {
                if(counts[p].length > 2) {
                  samePointTeams = counts[p];
                }
              }
            if((b.points-a.points) != 0){
                return b.points-a.points;
            }
             else if((match = sortByMatch(a,b,samePointTeams)) != 0) {
                return match;
            } else if((gDifference = sortByGoals(a,b,samePointTeams)) != 0) {
                return gDifference;
            } else if((mostGoals = sortByMostGoals(a,b)) != 0) {
                return mostGoals;
            } else {
              console.log('return by rank');
                return a.rank-b.rank;
            }
        });


    }

    var sortByMatch = function(a,b,t) {

        var teams = t || [];
        var idxA, idxB;
        if((idxA = teams.indexOf(a)) > -1) {
          teams.splice(idxA,1);
        }
        if((idxB = teams.indexOf(b)) > -1) {
          teams.splice(idxB,1);
        }

        c = teams.length > 0 ? teams[0] : null;


        var go = false;
        var idx = -1;
        var wA = wB = wC = 0;

        self.matches.forEach(function(match,index){
            if((match.teamA == a || match.teamA == b) && (match.teamB == a || match.teamB == b)){
                if((match.score.teamA-match.score.teamB) == 0) {
                    go = false;
                } else if(match.teamA == a) {
                    wA = (match.score.teamA-match.score.teamB) > 0 ? 1 : wA ;
                    wB = (match.score.teamB-match.score.teamA) > 0 ? 1 : wB ;
                    go = true;
                    idx = index;
                } else {
                    wB = (match.score.teamA-match.score.teamB) > 0 ? 1 : wB ;
                    wA = (match.score.teamB-match.score.teamA) > 0 ? 1 : wA ;
                    go = true;
                    idx = index;
                }
            }else if((match.teamA == a || match.teamA == c) && (match.teamB == a || match.teamB == c)){
                if((match.score.teamA-match.score.teamB) == 0) {
                    go = false;
                } else if(match.teamA == a) {
                    wA = (match.score.teamA-match.score.teamB) > 0 ? 1 : wA ;
                    wC = (match.score.teamB-match.score.teamA) > 0 ? 1 : wC ;
                } else {
                    wC = (match.score.teamA-match.score.teamB) > 0 ? 1 : wC ;
                    wA = (match.score.teamB-match.score.teamA) > 0 ? 1 : wA ;
                }
            } else if((match.teamA == c || match.teamA == b) && (match.teamB == c || match.teamB == b)){
                if((match.score.teamA-match.score.teamB) == 0) {
                    go = false;
                } else if(match.teamA == b) {
                    wB =  (match.score.teamA-match.score.teamB) > 0 ? 1 : wB ;
                    wC = (match.score.teamB-match.score.teamA) > 0 ? 1 : wC ;
                } else {
                    wC = (match.score.teamA-match.score.teamB) > 0 ? 1 : wC ;
                    wB = (match.score.teamB-match.score.teamA) > 0 ? 1 : wB ;
                }
            }
        })

        if(wA && wB && wC) {
          // Store stats
          var stats = {a:{f:a.goalsFor, a:a.goalsAgainst},b:{f:b.goalsFor, a:b.goalsAgainst}};
          // Remove stats agianst the fourth team
          self.matches.forEach(function(match,index) {
            if((match.teamA == a || match.teamB == a) && (match.teamA != b && match.teamB != b && match.teamA != c && match.teamB != c)) {

              if(a == match.teamA) {
                a.goalsFor -= match.score.teamA;
                a.goalsAgainst -= match.score.teamB;
              } else {
                a.goalsFor -= match.score.teamB;
                a.goalsAgainst -= match.score.teamA;
              }
            } else if((match.teamA == b || match.teamB == b) && (match.teamA != a && match.teamB != a && match.teamA != c && match.teamB != c)) {
              if(b == match.teamA) {
                b.goalsFor -= match.score.teamA;
                b.goalsAgainst -= match.score.teamB;
              } else {
                b.goalsFor -= match.score.teamB;
                b.goalsAgainst -= match.score.teamA;
              }
            }
          })

          // Check if their stats differ
          var rValue = 0;
          var gD,mG;
          if((gD = sortByGoals(a,b)) != 0) {
              rValue = gD;
          } else if((mG = sortByMostGoals(a,b)) != 0) {
              rValue = mG;
          }


          // Restore stats
          a.goalsFor = stats.a.f;
          a.goalsAgainst = stats.a.a;
          b.goalsFor = stats.b.f;
          b.goalsAgainst = stats.b.a;

          // return
          return rValue;

        } else {
          if(go) {
            if(self.matches[idx].teamA == a) {
              return self.matches[idx].score.teamB-self.matches[idx].score.teamA;
            } else {
              return self.matches[idx].score.teamA-self.matches[idx].score.teamB;
            }
          } else {
            return 0;
         }
        }
    }

    var sortByGoals = function(a,b) {
        var aDiff = a.goalsFor-a.goalsAgainst;
        var bDiff = b.goalsFor-b.goalsAgainst;
        return bDiff-aDiff;
    }

    var sortByMostGoals = function(a,b) {
        return b.goalsFor-a.goalsFor;
    }

    this.initMatches = function() {
        for (var i = 0; i < self.teams.length-1; i++) {
            for (var j = i+1; j < self.teams.length; j++) {
                self.addMatch(new match(self.teams[i],self.teams[j]));
            }
        }
    }
}

var em = {

    currentGroup: 'groupA',
    currentMatch: 0,
    currentPlayoff: 'eighthfinal',

    groupStage: {
        groupA: new group("A"),
        groupB: new group("B"),
        groupC: new group("C"),
        groupD: new group("D"),
        groupE: new group("E"),
        groupF: new group("F")
    },

    playoff: {
        eighthfinal: {},
        quarterfinal: {},
        semifinal: {},
        final: {},
    },

    initTeams: function() {
        // Group A
        this.groupStage.groupA.addTeam(new team('Albania','alb', 31));
        this.groupStage.groupA.addTeam(new team('France','fra', 8));
        this.groupStage.groupA.addTeam(new team('Romania','rom', 18));
        this.groupStage.groupA.addTeam(new team('Switzerland','swi', 10));
        this.groupStage.groupA.initMatches();

        // Group B
        this.groupStage.groupB.addTeam(new team('England','eng', 3));
        this.groupStage.groupB.addTeam(new team('Wales','wal', 28));
        this.groupStage.groupB.addTeam(new team('Slovakia','slo', 26));
        this.groupStage.groupB.addTeam(new team('Russia','rus', 9));
        this.groupStage.groupB.initMatches();

        // Group C
        this.groupStage.groupC.addTeam(new team('Germany','deu', 1));
        this.groupStage.groupC.addTeam(new team('Nothern Irland','nor', 33));
        this.groupStage.groupC.addTeam(new team('Poland','pol', 17));
        this.groupStage.groupC.addTeam(new team('Ukraine','ukr', 14));
        this.groupStage.groupC.initMatches();

        // Group D
        this.groupStage.groupD.addTeam(new team('Croatia','cro',12));
        this.groupStage.groupD.addTeam(new team('Czech Republic','czr',15));
        this.groupStage.groupD.addTeam(new team('Spain','spi',2));
        this.groupStage.groupD.addTeam(new team('Turkey','tur',22));
        this.groupStage.groupD.initMatches();

        // Group E
        this.groupStage.groupE.addTeam(new team('Sweden','swe',16));
        this.groupStage.groupE.addTeam(new team('Belgium','bel',5));
        this.groupStage.groupE.addTeam(new team('Ireland','ire',23));
        this.groupStage.groupE.addTeam(new team('Italy','ita',6));
        this.groupStage.groupE.initMatches();

        // Group F
        this.groupStage.groupF.addTeam(new team('Austria','aus',11));
        this.groupStage.groupF.addTeam(new team('Hungary','hun',20));
        this.groupStage.groupF.addTeam(new team('Iceland','ice',27));
        this.groupStage.groupF.addTeam(new team('Portugal','por',4));
        this.groupStage.groupF.initMatches();

    },

    addScore: function() {
        var g = this.groupStage;
        for(var group in g) {
            if(g.hasOwnProperty(group)) {
                g[group].matches.forEach(function(match,index){
                    var text = "Enter Score in match " + match.teamA.name + " vs " + match.teamB.name;
                    var scoreA = prompt(text,0);
                })
            }
        }
    },

    nextGroup: function(key) {
      var g = this.groupStage;
      var keys = Object.keys(g).sort();
      var loc = keys.indexOf(key);
      if(loc > -1 && typeof keys[loc+1] != 'undefined') {
          em.currentGroup = keys[loc+1];
          return true;
      }
      return false;
    },

    nextPlayoff: function(key) {
      if(key == "eighthfinal") {
        return "quarterfinal";
      } else if(key == "quarterfinal") {
        return "semifinal";
      } else if (key == "semifinal") {
        return "final";
      }
      return this.currentPlayoff;
    },

    addPoints: function() {
        var first = parseInt(document.getElementById('firstInput').value);
        var second = parseInt(document.getElementById('secondInput').value);
        var g = em.groupStage;
        var cg = em.currentGroup;
        var cm = em.currentMatch;
        var currentGroup = document.getElementById("tBodyGroup"+g[cg].name);
        var cgr = document.getElementById("rBodyGroup"+g[cg].name);

        if(g.hasOwnProperty(cg)) {
            if(typeof g[cg].matches[cm] != 'undefined') {
                // Add score
                g[cg].addScore(g[cg].matches[cm],first,second,g[cg].matches[cm].teamA,g[cg].matches[cm].teamB);

                // Update group graphics
                g[cg].orderGroup();

                // Clear the table and update it
                currentGroup.innerHTML = "";
                var teams = g[cg].teams;
                $("<tr><td>"+teams[0].name+"</td><td>"+teams[0].matches+"</td><td>"+(teams[0].goalsFor-teams[0].goalsAgainst).toString()+"</td><td>"+teams[0].points+"</td></tr>")
                .appendTo(currentGroup);
                $("<tr><td>"+teams[1].name+"</td><td>"+teams[1].matches+"</td><td>"+(teams[1].goalsFor-teams[1].goalsAgainst).toString()+"</td><td>"+teams[1].points+"</td></tr>")
                .appendTo(currentGroup);
                $("<tr><td>"+teams[2].name+"</td><td>"+teams[2].matches+"</td><td>"+(teams[2].goalsFor-teams[2].goalsAgainst).toString()+"</td><td>"+teams[2].points+"</td></tr>")
                .appendTo(currentGroup);
                $("<tr><td>"+teams[3].name+"</td><td>"+teams[3].matches+"</td><td>"+(teams[3].goalsFor-teams[3].goalsAgainst).toString()+"</td><td>"+teams[3].points+"</td></tr>")
                .appendTo(currentGroup);

                // Append the score to the results table
                $("<tr><td>"+g[cg].matches[cm].teamA.name+"</td><td>"+first+"</td><td>-</td><td>"+second+"</td><td>"+g[cg].matches[cm].teamB.name+"</td></tr>")
                .appendTo(cgr);


                // Update currentMatch
                em.currentMatch++;
                var c = em.currentMatch;

                // Update html
                if(typeof g[cg].matches[c] != 'undefined') {
                    document.getElementById("currentTeamA").innerHTML = g[cg].matches[c].teamA.name;
                    document.getElementById("currentTeamB").innerHTML = g[cg].matches[c].teamB.name;
                } else {
                    g[em.currentGroup].orderGroup();
                    if(em.nextGroup(cg)) {
                        em.currentMatch = 0;
                        var c = em.currentMatch;
                        var cg = em.currentGroup;

                        $("#currentGroup").text("Group"+g[cg].matches[c].teamA.group);
                        document.getElementById("currentTeamA").innerHTML = g[cg].matches[c].teamA.name;
                        document.getElementById("currentTeamB").innerHTML = g[cg].matches[c].teamB.name;
                    } else {
                        // Decide the four best thirds & sort them by their groups.
                        var tempArray = []
                        for(var key in g) {
                            tempArray.push(g[key].teams[2]);
                        }
                        g.thirds = new group("Thirds");
                        g.thirds.teams = tempArray.slice(0,6);

                        g.thirds.orderGroup();
                        g.thirds.teams = g.thirds.teams.slice(0,4);
                        g.thirds.teams.sort(function(a,b){
                          return a.group.toLowerCase().localeCompare(b.group.toLowerCase());
                        });


                        // Show the tournament tree
                        em.currentMatch = 0;
                        em.initTournamentTree();
                    }
                }
            }
        }
        $("#firstInput").focus().val("");
        $("#secondInput").val("");
    },

    setPointsPlayoff: function() {
      var first = parseInt(document.getElementById('firstInput').value);
      var second = parseInt(document.getElementById('secondInput').value);
      var g = em.playoff;
      var cg = em.currentPlayoff;
      var cm = em.currentMatch;



      if(g.hasOwnProperty(cg)) {
          if(typeof g[cg].matches[cm] != 'undefined') {
            g[cg].matches[cm].score.teamA = first;
            g[cg].matches[cm].score.teamB = second;

            winner = first > second ? g[cg].matches[cm].teamA : g[cg].matches[cm].teamB
            if(cg != 'final') {
              if(cm % 2) {
                g[em.nextPlayoff(cg)].matches[((cm-1)/2)].teamB = winner;
              } else {
                g[em.nextPlayoff(cg)].matches[(cm/2)].teamA = winner;
              }
            } else {
              $("#r7c4").text(winner.name);
            }

            em.currentMatch++;
            em.setPlayOffTeams();


          } else {
            if(em.currentPlayoff == 'final') {
              console.log('end tournament');
            } else {
              em.currentMatch = 0;
              em.currentPlayoff = em.nextPlayoff(cg);
              em.setPointsPlayoff();
            }
          }

          if(typeof g[cg].matches[em.currentMatch] != 'undefined') {
            $("#currentGroup").text(em.currentPlayoff);
            document.getElementById("currentTeamA").innerHTML = g[cg].matches[em.currentMatch].teamA.name;
            document.getElementById("currentTeamB").innerHTML = g[cg].matches[em.currentMatch].teamB.name;
          } else {
            $("#currentGroup").text(em.currentPlayoff);
            document.getElementById("currentTeamA").innerHTML = g[cg].matches[0].teamA.name;
            document.getElementById("currentTeamB").innerHTML = g[cg].matches[0].teamB.name;
          }
          $("#firstInput").focus().val("");
          $("#secondInput").val("");

        }


        // em.setPlayOffTeams();

    },

    initEuro: function() {
        var wrapper = document.getElementById("nojsEuro");
        // Create Sceleton for the scores
        $("<div class='container-fluid'><div id='addScoreRow' class='row' style='margin: 100px 0;'><div class='col-lg-4'></div><div id='addScoreDiv' class='col-lg-4 text-center'></div><div class='col-lg-4'></div></div>")
        .appendTo(wrapper);

        // Create the actual interface
        var place = document.getElementById("addScoreDiv");
        $("<h1>EURO 2016</h1><h3 id='currentGroup'>Group"+em.groupStage[em.currentGroup].name+"</h3><span id='currentTeamA'></span> <input id='firstInput' type='text' value='' maxlength='2' size='3'> - <input id='secondInput' type='text' value='' maxlength='2' size='3'> <span id='currentTeamB'></span><br><br><button id='buttonNext' type='button' class='btn btn-primary' disabled>Next</button>")
        .appendTo(place);


        $("#firstInput").click(validateNumber);
        $("#firstInput").keyup(validateNumber);
        $("#secondInput").click(validateNumber);
        $("#secondInput").keyup(validateNumber);
        $("#buttonNext").click(this.addPoints);
        // var btn = document.getElementById("buttonNext");
        // btn.onclick = this.addPoints;

        document.getElementById("currentTeamA").innerHTML = this.groupStage[this.currentGroup].matches[this.currentMatch].teamA.name;
        document.getElementById("currentTeamB").innerHTML = this.groupStage[this.currentGroup].matches[this.currentMatch].teamB.name;

        // Create the group interface
        $("<div id='groupGraphics' class='row'></div>")
        .appendTo(document.getElementsByClassName('container-fluid'));

        var gs = this.groupStage;
        var where = document.getElementById("groupGraphics");
        for(var g in gs ) {
            // Sceleton
            $('<div class="col-lg-2"><div class="panel panel-primary"><div class="panel-heading"><h3 class="panel-title">Group '+gs[g].name+'</h3></div><ul class="nav nav-tabs"><li class="active"><a href="#tabTableGroup'+gs[g].name+'" data-toggle="tab">Table</a></li><li><a href="#tabResultGroup'+gs[g].name+'" data-toggle="tab">Results</a></li></ul><div class="tab-content"><div class="tab-pane fade in active" id="tabTableGroup'+gs[g].name+'"><table class="table" id="dev-table"><thead><tr><th>Country</th><th>M</th><th>+/-</th><th>P</th></tr></thead><tbody id="tBodyGroup'+gs[g].name+'"></tbody></table></div><div class="tab-pane fade" id="tabResultGroup'+gs[g].name+'"><table class="table" id="dev-table"><thead><tr><th class="text-center">Home</th><th></th><th></th><th></th><th class="text-center">Away</th></tr></thead><tbody class="text-center" id="rBodyGroup'+gs[g].name+'"></tbody></table></div></div></div></div>')
            .appendTo(where);

            var tBody = document.getElementById("tBodyGroup"+gs[g].name);
            var teams = gs[g].teams;
            $("<tr id='tBodyGroup"+gs[g].name+"TeamOne'><td>"+teams[0].name+"</td><td>"+teams[0].matches+"</td><td>"+(teams[0].goalsFor-teams[0].goalsAgainst).toString()+"</td><td>"+teams[0].points+"</td></tr>")
            .appendTo(tBody);
            $("<tr id='tBodyGroup"+gs[g].name+"TeamTwo'><td>"+teams[1].name+"</td><td>"+teams[1].matches+"</td><td>"+(teams[1].goalsFor-teams[1].goalsAgainst).toString()+"</td><td>"+teams[1].points+"</td></tr>")
            .appendTo(tBody);
            $("<tr id='tBodyGroup"+gs[g].name+"TeamThree'><td>"+teams[2].name+"</td><td>"+teams[2].matches+"</td><td>"+(teams[2].goalsFor-teams[2].goalsAgainst).toString()+"</td><td>"+teams[2].points+"</td></tr>")
            .appendTo(tBody);
            $("<tr id='tBodyGroup"+gs[g].name+"TeamFour'><td>"+teams[3].name+"</td><td>"+teams[3].matches+"</td><td>"+(teams[3].goalsFor-teams[3].goalsAgainst).toString()+"</td><td>"+teams[3].points+"</td></tr>")
            .appendTo(tBody);

        }
    },

    initTournamentTree: function() {
      // Reset
      for(var p in em.playoff) {
        em.playoff[p] = {matches: [], teams: []};
      }

      var tt = this.groupStage.thirds.teams;
      var bestThirds = tt[0].group+tt[1].group+tt[2].group+tt[3].group;

      // $("#addScoreDiv").html("<h1>EURO 2016</h1><p>");
      $("#addScoreRow").css('margin','20px auto');
      var bb = {property:"border-bottom", value: "1px solid #000"};
      var br = {property: "border-right", value: "1px solid #000"};
      var bbs = ['r0c0','r1c1','r2c0','r3c2','r4c0','r5c1','r6c0','r7c3','r8c0','r9c1','r10c0','r11c2','r12c0','r13c1','r14c0'];
      var brs = ['r1c0','r2c0','r2c1','r3c1','r4c1','r4c2','r5c0','r5c1','r5c2','r6c0','r6c2','r7c2','r8c2','r9c0','r9c2','r10c0','r10c1','r10c2','r11c1','r11c2','r12c1','r13c0','r13c1','r14c0'];
      var alignb = ['r0c0','r2c0','r4c0','r6c0','r8c0','r10c0','r12c0','r14c0','r1c1','r3c1','r5c1','r7c1','r9c1','r3c2','r11c2','r7c3','r7c4', 'r13c1'];
      var alignt = ['r1c0','r3c0','r5c0','r7c0','r9c0','r11c0','r13c0','r15c0','r2c1','r4c1','r6c1','r8c1','r9c2','r12c2','r8c3'];
      var nBody = document.getElementById("nojsEuro");
      $("<div id='tournamentTree' class='panel panel-primary'><div class='panel-heading'>The Tournament Tree</div>"
      +"<div class='panel-body'>"
      +"<div class='row'><div class='col-lg-8'>"
      +"<div id='tournamentTable' style='display:table; width: 100%; margin: 0 auto;'></div></div><div class='col-lg-4'></div>"
      +"</div></div></div>")
      .insertAfter("#addScoreRow");


      //<div style="display: table; width: 1000px; margin: 0 auto;"
      for (var i = 0; i < 16; i++) {
        var html = '<div style="display: table-row; height: 30px;">';
        for (var j = 0; j < 5; j++) {
          html += '<div id="r'+i+'c'+j+'"style="display: table-cell; width: 20%; padding-left: 3px;"></div>';
        }
        html += '</div>';
        $(html).
        appendTo(document.getElementById("tournamentTable"));
      }

      // Set specific attributes
      for (var i = 0; i < bbs.length; i++) {
        $("#"+bbs[i]).css(bb.property,bb.value);
      }

      for (var i = 0; i < brs.length; i++) {
        $("#"+brs[i]).css(br.property,br.value);
      }

      for (var i = 0; i < alignb.length; i++) {
        $("#"+alignb[i]).css('vertical-align','bottom');
      }

      for (var i = 0; i < alignt.length; i++) {
        $("#"+alignt[i]).css('vertical-align','top');
      }

      // Lets decide the tree
      var wap, // Winner Group A Plays Agianst.. etc
          wbp,
          wcp,
          wdp;

      // wap will face 3c or 3d or 3e
      var wa3c = ['ABCD','ABCE','ABCF','ACDE','ACDF','ACEF','BCDE','BCDF','CDEF'];
      var wa3d = ['ABDE','ABDF','ADEF'];
      var wa3e = ['ABEF','BCEF','BDEF'];

      var wb3a = ['ABCE','ABCF','ABDE', 'ABDF', 'ABEF','ACEF','ADEF'];
      var wb3d = ['ABCD','ACDE', 'ACDF','BCDE', 'BCDF', 'BDEF', 'CDEF'];
      var wb3c = ['BCEF'];

      var wc3a = ['ABCD','ACDE','ACDF'];
      var wc3b = ['ABCE','ABCF','ABDE','ABDF','ABEF', 'BCDE', 'BCDF','BCEF','BDEF'];
      var wc3f = ['ACEF','ADEF','CDEF'];

      var wd3b = ['ABCD'];
      var wd3e = ['ABCE','ABDE','ACDE','ACEF','ADEF','BCDE','CDEF'];
      var wd3f = ['ABCF','ABDF','ABEF','ACDF','BCDF','BCEF','BDEF'];

      if(wa3c.indexOf(bestThirds) > -1) {
        wap = em.groupStage['groupC'].teams[2];
      } else if(wa3d.indexOf(bestThirds) > -1) {
        wap = em.groupStage['groupD'].teams[2];
      } else if(wa3e.indexOf(bestThirds) > -1) {
        wap = em.groupStage['groupE'].teams[2];
      }

      if(wb3a.indexOf(bestThirds) > -1) {
        wbp = em.groupStage['groupA'].teams[2];
      } else if(wb3d.indexOf(bestThirds) > -1) {
        wbp = em.groupStage['groupD'].teams[2];
      } else if(wb3c.indexOf(bestThirds) > -1) {
        wbp = em.groupStage['groupC'].teams[2];
      }

      if(wc3a.indexOf(bestThirds) > -1) {
        wcp = em.groupStage['groupA'].teams[2];
      } else if(wc3b.indexOf(bestThirds) > -1) {
        wcp = em.groupStage['groupB'].teams[2];
      } else if(wc3f.indexOf(bestThirds) > -1) {
        wcp = em.groupStage['groupF'].teams[2];
      }

      if(wd3b.indexOf(bestThirds) > -1) {
        wdp = em.groupStage['groupB'].teams[2];
      } else if(wd3e.indexOf(bestThirds) > -1) {
        wdp = em.groupStage['groupE'].teams[2];
      } else if(wd3f.indexOf(bestThirds) > -1) {
        wdp = em.groupStage['groupF'].teams[2];
      }

      em.playoff.eighthfinal.teams.push(em.groupStage["groupA"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupA"].teams[1]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupB"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupB"].teams[1]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupC"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupC"].teams[1]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupD"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupD"].teams[1]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupE"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupE"].teams[1]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupF"].teams[0]);
      em.playoff.eighthfinal.teams.push(em.groupStage["groupF"].teams[1]);
      em.playoff.eighthfinal.teams.push(wap);
      em.playoff.eighthfinal.teams.push(wbp);
      em.playoff.eighthfinal.teams.push(wcp);
      em.playoff.eighthfinal.teams.push(wdp);



      // Match 1 RA vs RC
      $("#r0c0").append(em.groupStage["groupA"].teams[1].name);
      $("#r1c0").append(em.groupStage["groupC"].teams[1].name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupA"].teams[1],em.groupStage["groupC"].teams[1]));
      // Match 2 WD vs wdp
      $("#r2c0").append(em.groupStage["groupD"].teams[0].name);
      $("#r3c0").append(wdp.name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupD"].teams[00],wdp));
      // Macth 3 WB vs wbp
      $("#r4c0").append(em.groupStage["groupB"].teams[0].name);
      $("#r5c0").append(wbp.name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupB"].teams[0],wbp));

      // Match 4 WF vs RE
      $("#r6c0").append(em.groupStage["groupF"].teams[0].name);
      $("#r7c0").append(em.groupStage["groupE"].teams[1].name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupF"].teams[0],em.groupStage["groupE"].teams[1]));

      // Match 5 WC vs wcp
      $("#r8c0").append(em.groupStage["groupC"].teams[0].name);
      $("#r9c0").append(wcp.name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupC"].teams[0],wcp));

      // Match 6 WE vs RD
      $("#r10c0").append(em.groupStage["groupE"].teams[0].name);
      $("#r11c0").append(em.groupStage["groupD"].teams[1].name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupE"].teams[0],em.groupStage["groupD"].teams[1]));

      // Macth 7 WA vs wap
      $("#r12c0").append(em.groupStage["groupA"].teams[0].name);
      $("#r13c0").append(wap.name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupA"].teams[0],wap));

      // Match 8 RB vs RF
      $("#r14c0").append(em.groupStage["groupB"].teams[1].name);
      $("#r15c0").append(em.groupStage["groupF"].teams[1].name);
      em.playoff.eighthfinal.matches.push(new match(em.groupStage["groupB"].teams[1],em.groupStage["groupF"].teams[1]));

      // Set the rest
      for (var i = 0; i < 4; i++) {
        em.playoff.quarterfinal.matches.push(new match());
      }
      em.playoff.semifinal.matches.push(new match());
      em.playoff.semifinal.matches.push(new match());
      em.playoff.final.matches.push(new match());

      validatePlayoffNumber();
      $("#firstInput").unbind();
      $("#secondInput").unbind();
      $("#buttonNext").unbind();
      $("#firstInput").keyup(validatePlayoffNumber);
      $("#firstInput").click(validatePlayoffNumber);
      $("#secondInput").keyup(validatePlayoffNumber);
      $("#secondInput").click(validatePlayoffNumber);

      $("#buttonNext").click(this.setPointsPlayoff);

      $("#currentGroup").text(em.currentPlayoff);
      $("#currentTeamA").text(em.playoff[em.currentPlayoff].matches[em.currentMatch].teamA.name);
      $("#currentTeamB").text(em.playoff[em.currentPlayoff].matches[em.currentMatch].teamB.name);



    },

    setPlayOffTeams: function() {

      // quarterfinal
      $("#r1c1").text(em.playoff["quarterfinal"].matches[0].teamA.name);
      $("#r2c1").text(em.playoff["quarterfinal"].matches[0].teamB.name);

      $("#r5c1").text(em.playoff["quarterfinal"].matches[1].teamA.name);
      $("#r6c1").text(em.playoff["quarterfinal"].matches[1].teamB.name);

      $("#r9c1").text(em.playoff["quarterfinal"].matches[2].teamA.name);
      $("#r10c1").text(em.playoff["quarterfinal"].matches[2].teamB.name);

      $("#r13c1").text(em.playoff["quarterfinal"].matches[3].teamA.name);
      $("#r14c1").text(em.playoff["quarterfinal"].matches[3].teamB.name);


      // semifinal
      $("#r3c2").text(em.playoff["semifinal"].matches[0].teamA.name);
      $("#r4c2").text(em.playoff["semifinal"].matches[0].teamB.name);

      $("#r11c2").text(em.playoff["semifinal"].matches[1].teamA.name);
      $("#r12c2").text(em.playoff["semifinal"].matches[1].teamB.name);


      $("#r7c3").text(em.playoff["final"].matches[0].teamA.name);
      $("#r8c3").text(em.playoff["final"].matches[0].teamB.name);




    },

}

// Validate so the scores are integers
function validateNumber() {
    var first = parseInt(document.getElementById('firstInput').value);
    var second = parseInt(document.getElementById('secondInput').value);
    if(!isNaN(first) && !isNaN(second)) {
         document.getElementById('buttonNext').disabled=false;
    } else {
        document.getElementById('buttonNext').disabled=true;
    }
}

// Validate so the scores are integers
function validatePlayoffNumber() {
    var first = parseInt(document.getElementById('firstInput').value);
    var second = parseInt(document.getElementById('secondInput').value);
    if(!isNaN(first) && !isNaN(second) && first != second) {
         document.getElementById('buttonNext').disabled=false;
    } else {
        document.getElementById('buttonNext').disabled=true;
    }
}

// Start of with initalize the teams in each group & then the graphics
em.initTeams();
em.initEuro();
