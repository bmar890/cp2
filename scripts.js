function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function cutProficiencies(word) {
  return word.split(": ").pop();
}

function englishSense(word) {
  let str = "";
  let nextCap = true;
  for (let i = 0; i < word.length; i++) {
    if (nextCap) {
      str = str + word.charAt(i).toUpperCase();
      nextCap = false;
    }
    else if (word.charAt(i) === '_') {
      str = str + " ";
      nextCap = true;
    }
    else {
      str = str + word.charAt(i);
    }
  }
  return str;
}

function getCRFraction(cr) {
  if (cr === 0.125) {
    return "1/8";
  }
  else if (cr === 0.25) {
    return "1/4";
  }
  else if (cr === 0.5) {
    return "1/2";
  }
  else {
    return "" + cr;
  }
}





document.getElementById("monsterSubmit").addEventListener("click", function(event) {
  event.preventDefault();
  const value = document.getElementById("monsterInput").value;
  if (value === "")
    return;
  let string = "";
  for (let i=0; i < value.length; i++) {
    if (value.charAt(i) === ' ') {
      string = string + "-";
    }
    else {
      string = string + value.charAt(i).toLowerCase();
    }
  }


  const url = "https://www.dnd5eapi.co/api/monsters/" + string;
     fetch(url)
     .then(function(response) {
       return response.json();
     }).then(function(json) {
       if (json.hasOwnProperty("error")) {
         if (json.error === "Not found") {
           let results = "";
           results += "<p class='errorMessage'>No creatures found.</p>";

           const new_url = "https://www.dnd5eapi.co/api/monsters/?name=" + string;
              fetch(new_url)
              .then(function(response) {
                return response.json();
              }).then(function(json) {
                if (json.count != 0) {
                  results += "<p class='suggestion'>Did you maybe mean...?</p>";
                  results += "<ul>";
                  for (let i=0; i < json.results.length; i++) {
                    results += "<li>";
                      results += json.results[i].name;
                    results += "</li>";
                  }
                  results += "</ul>";
                }


                document.getElementById("monsterResults").innerHTML = results;
              });
         }
       }
       else {
        let results = "";

        // Creature name
        results += '<h2 class="creatureName">' + json.name + "</h2>";
        console.log(json)

        // Heading
        results += '<p class="sizeType"><em>' + json.size + " " + json.type;
        if (json.subtype != null) {
          results += " (" + json.subtype + ")";
        }
        results += ", " + json.alignment;
        results += "</em></p>";

        // Stats
        results += "<p class='stats'><strong>Armor Class</strong> " + json.armor_class + "</p>";
        results += "<p class='stats'><strong>Hit Points</strong> " + json.hit_points + " (" + json.hit_dice + ")</p>";
        results += "<p class='stats'><strong>Speed</strong> ";
        for (var key of Object.keys(json.speed)) {
            if (key != "walk") {
              results += ", " + key + " ";
            }
            results += json.speed[key];
        }
        results += "</p>";
        results += "<hr/>";

        // Retrieving modifiers
        str = Math.floor((json.strength - 10)/2);
        if (str < 0) {
          str = "-" + (-1*str);
        }
        else {
          str = "+" + str;
        }

        dex = Math.floor((json.dexterity - 10)/2);
        if (dex < 0) {
          dex = "-" + (-1*dex);
        }
        else {
          dex = "+" + dex;
        }

        con = Math.floor((json.constitution - 10)/2);
        if (con < 0) {
          con = "-" + (-1*con);
        }
        else {
          con = "+" + con;
        }

        int = Math.floor((json.intelligence - 10)/2);
        if (int < 0) {
          int = "-" + (-1*int);
        }
        else {
          int = "+" + int;
        }

        wis = Math.floor((json.wisdom - 10)/2);
        if (wis < 0) {
          wis = "-" + (-1*wis);
        }
        else {
          wis = "+" + wis;
        }

        cha = Math.floor((json.charisma - 10)/2);
        if (cha < 0) {
          cha = "-" + (-1*cha);
        }
        else {
          cha = "+" + cha;
        }

        // Ability Scores
        results += "<div class='scoreContainer'>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>STR</p>";
            results += "<p class='score'>" + json.strength + "</p>";
            results += "<p class='modifier'>(" + str + ")</p>";
          results += "</div>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>DEX</p>";
            results += "<p class='score'>" + json.dexterity + "</p>";
            results += "<p class='modifier'>(" + dex + ")</p>";
          results += "</div>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>CON</p>";
            results += "<p class='score'>" + json.constitution + "</p>";
            results += "<p class='modifier'>(" + con + ")</p>";
          results += "</div>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>INT</p>";
            results += "<p class='score'>" + json.intelligence + "</p>";
            results += "<p class='modifier'>(" + int + ")</p>";
          results += "</div>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>WIS</p>";
            results += "<p class='score'>" + json.wisdom + "</p>";
            results += "<p class='modifier'>(" + wis + ")</p>";
          results += "</div>";
          results += "<div class='scoreValues'>";
            results += "<p class='scoreName'>CHA</p>";
            results += "<p class='score'>" + json.charisma + "</p>";
            results += "<p class='modifier'>(" + cha + ")</p>";
          results += "</div>";
        results += "</div>";

        results += "<hr/>";

        // Separating Saving Throw and Skill Proficiencies
        saves = [];
        skills = [];

        for (const element of json.proficiencies) {
          if (element.proficiency.name.startsWith('Saving Throw:')) {
            saves.push(element);
          }
          else {
            skills.push(element);
          }
        }


        // Saving Throws
        if (saves.length > 0) {
            results += "<p class='characteristics'><strong>Saving Throws </strong>";
            for (let i=0; i < saves.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += cutProficiencies(saves[i].proficiency.name);
              results += "+" + saves[i].value;
            }
        }
        results += "</p>";

        // Skill Proficiencies
        if (skills.length > 0) {
            results += "<p class='characteristics'><strong>Skills </strong>";
            for (let i=0; i < skills.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += cutProficiencies(skills[i].proficiency.name);
              results += "+" + skills[i].value;
            }
        }
        results += "</p>";

        // Damage Vulnerabilities
        if (json.damage_vulnerabilities.length > 0) {
            results += "<p class='characteristics'><strong>Damage Vulnerabilities </strong>";
            for (let i=0; i < json.damage_vulnerabilities.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += json.damage_vulnerabilities[i];
            }
        }
        results += "</p>";

        // Damage Resistances
        if (json.damage_resistances.length > 0) {
            results += "<p class='characteristics'><strong>Damage Resistances </strong>";
            for (let i=0; i < json.damage_resistances.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += json.damage_resistances[i];
            }
        }
        results += "</p>";

        // Damage Immunities
        if (json.damage_immunities.length > 0) {
            results += "<p class='characteristics'><strong>Damage Immunities </strong>";
            for (let i=0; i < json.damage_immunities.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += json.damage_immunities[i];
            }
        }
        results += "</p>";

        // Condition Immunities
        if (json.condition_immunities.length > 0) {
            results += "<p class='characteristics'><strong>Condition Immunities </strong>";
            for (let i=0; i < json.condition_immunities.length; i++) {
              if (i > 0) {
                results += ", ";
              }
              results += json.condition_immunities[i].name;
            }
        }
        results += "</p>";

        // Senses
        results += "<p class='characteristics'><strong>Senses </strong>";
        let first = true;
        for (const key of Object.keys(json.senses)) {
          if (!first) {
            results += ", ";
          }
          else {
            first = false;
          }
          results += englishSense(key) + " " + json.senses[key];
        }
        results += "</p>";

        // Languages
        results += "<p class='characteristics'><strong>Languages </strong>";
        if (json.languages === "") {
          results += "--";
        }
        else {
          results += json.languages;
        }
        results += "</p>";


        // Challenge Rating and XP
        results += "<p class='characteristics'><strong>Challenge </strong>";
        results += getCRFraction(json.challenge_rating) + " (" + json.xp + " XP)";
        results += "</p>";

        results += "<hr/>";

        // Special abilities
        if (json.hasOwnProperty("special_abilities")) {
          for (let i=0; i < json.special_abilities.length; i++) {
            results += "<p style='white-space: pre-line' class='specialAbilities'>";
            results += "<em><strong>" + json.special_abilities[i].name;
            if (json.special_abilities[i].usage != null) {
              results += " (" + json.special_abilities[i].usage.times + " " + json.special_abilities[i].usage.type + ")";
            }
            results += " </strong></em>";
            results += json.special_abilities[i].desc;
            results += "</p>";
          }
          results += "<hr/>";
        }

        // Actions
        results += "<h2 class='actionTitle'>Actions</h2>";
        for (let i=0; i < json.actions.length; i++) {
          results += "<p class='actions'><em><strong>" + json.actions[i].name;
          if (json.actions[i].hasOwnProperty("usage")) {
            if (json.actions[i].usage.type === "recharge on roll") {
              results += " (Recharge ";
              if (json.actions[i].usage.min_value != 6) {
                results += json.actions[i].usage.min_value + "-6";
              }
              else {
                results += "6";
              }
              results += ")";
            }
          }
          results += " </strong></em>";
          results += json.actions[i].desc;
          results += "</p>";
        }

        // Legendary Actions
        if (json.hasOwnProperty("legendary_actions")) {
          results += "<hr/>";
          results += "<h2 class='actionTitle'>Legendary Actions</h2>";
          results += "<p class='legendaryDesc'>The " + json.name + " can take 3 legendary actions, ";
          results += "choosing from the options below. Only one legendary action option can be used ";
          results += "at a time and only at the end of another creature's turn. The " + json.name;
          results += " regains spent legendary actions at the start of its turn.</p>";
          for (let i=0; i < json.legendary_actions.length; i++) {
            results += "<p class='actions'><em><strong>" + json.legendary_actions[i].name;
            results += " </strong></em>";
            results += json.legendary_actions[i].desc;
            results += "</p>";
          }
        }

        document.getElementById("monsterResults").innerHTML = results;
      }






     });

});
