const d = document,
  $main = d.getElementById("main"),
  $loader = d.getElementById("loader"),
  $resent = d.getElementById("resent"),
  $userImg = d.getElementById("user-img"),
  $username = d.getElementById("username"),
  $joined = d.getElementById("joined"),
  $userTwitter = d.getElementById("user-twitter"),
  $bio = d.getElementById("bio"),
  $repos = d.getElementById("repos"),
  $followers = d.getElementById("followers"),
  $following = d.getElementById("following"),
  $country = d.getElementById("country"),
  $twitter = d.getElementById("twitter"),
  $website = d.getElementById("website"),
  $github = d.getElementById("github"),
  $inputSearch = d.getElementById("input-search");

console.log($inputSearch);
class SaveData {
  constructor() {
    this.db;
    //create to databases of the searching
    if (!localStorage.getItem("search")) {
      localStorage.setItem("search", "[]");
      this.db = localStorage.getItem("search");

      this.save(
        $userImg.src,
        $username.innerText,
        $joined.innerText,
        $userTwitter.innerText,
        $bio.innerText,
        $repos.innerText,
        $followers.innerText,
        $following.innerText,
        $country.innerText,
        $website.href,
        $github.href
      );
    } else {
      this.db = localStorage.getItem("search");
    }
  }
  save(
    img,
    username,
    joined,
    userTwitter,
    bio,
    repos,
    followers,
    following,
    country,
    website,
    github
  ) {
    let dbParse = JSON.parse(this.db),
      data = {
        img: img,
        username: username,
        joined: joined,
        userTwitter: userTwitter,
        bio: bio,
        repos: repos,
        followers: followers,
        following: following,
        country: country,
        website: website,
        github: github,
      },
      state = false,
      i = 0;
    dbParse.forEach((element) => {
      if (element["username"] === username) {
        dbParse.splice(i, 1);
        dbParse.push(data);
        state = true;
        localStorage.setItem("search", JSON.stringify(dbParse));
        this.db = localStorage.getItem("search");
      }
      i++;
    });
    if (state === false) {
      if (dbParse.length > 9) {
        dbParse.shift();
      }
      dbParse.push(data);
      localStorage.setItem("search", JSON.stringify(dbParse));
      this.db = localStorage.getItem("search");
    }
  }
}
class UX extends SaveData {
  constructor() {
    super();
  }
  printData(id) {
    let position = JSON.parse(this.db)[id];
    $twitter.innerText = "";
    $website.innerText = "";
    $userImg.src = position["img"];
    $username.innerText = position["username"];
    $joined.innerText = position["joined"].slice(0, 10);
    $bio.innerText = position["bio"];
    $repos.innerText = position["repos"];
    $followers.innerText = position["followers"];
    $following.innerText = position["following"];
    $country.innerText = position["country"].split(",")[0];
    if (position["userTwitter"] === "") {
      $userTwitter.innerText = ` @?`;

      $twitter.innerText = "?";
      $twitter.href = "#";
      $twitter.target = "";
    } else {
      $userTwitter.innerText = ` @${position["userTwitter"]}`;

      $twitter.innerText = `twitter`;
      $twitter.href = `https://twitter.com/${position["userTwitter"]}`;
      $twitter.target = "_blank";
    }
    if (position["website"] === "") {
      $website.innerText = "?";
      $website.href = "#";
      $website.target = "";
    } else {
      $website.innerText = `Website`;
      $website.href = position["website"];
      $website.target = "_blank";
    }
    $github.href = position["github"];
  }
  printResent() {
    this.printData(JSON.parse(this.db).length - 1);
  }
  insertResent(valid) {
    const data = JSON.parse(this.db);
    let j = $resent.querySelectorAll("img").length - 1;
    for (let i of data) {
      if (i["username"] === valid) {
        $resent.querySelectorAll("img");
        $resent.querySelectorAll("img")[j].remove();
        this.printResent();
      }
      j--;
    }
    if ($resent.querySelectorAll("img").length >= 9) {
      $resent.querySelectorAll("img")[8].remove();
    }
    let $img = `<img src="${
      data[data.length - 1]["img"]
    }" style="animation-name: traY;" alt="${
      data[data.length - 1]["username"]
    }"/>`;

    $resent.insertAdjacentHTML("afterbegin", $img);
  }
  insertResentAll() {
    let position = JSON.parse(this.db),
      j = position.length - 1;
    for (let i of position.reverse()) {
      if (j < position.length - 1) {
        let $img = `
        <img src="${i["img"]}" alt="${i["username"]}" />
        `;
        $resent.insertAdjacentHTML("beforeend", $img);
      }
      j--;
    }
  }
  selectResent(e) {
    let db = JSON.parse(this.db),
      position = 0,
      $img = `<img src="${
        db[db.length - 1]["img"]
      }" style="animation-name: traY;" alt="${
        db[db.length - 1]["username"]
      }"/>`;
    for (let i of db) {
      if (i["username"] === e.alt) {
        $resent.insertAdjacentHTML("afterbegin", $img);
        db.splice(position, 1);
        db.push(i);
        this.printData(position);
        localStorage.setItem("search", JSON.stringify(db));
        this.db = localStorage.getItem("search");
        e.remove();
        break;
      }
      position++;
    }
  }
}
class Request extends UX {
  constructor() {
    super();
  }
  async requestData(user) {
    try {
      $main.classList.add("opacity");
      $loader.classList.add("opacity-active");
      let res = await fetch(`https://api.github.com/users/${user}`);
      let json = await res.json();
      if (!res.ok) throw { estado: res.status, estadoTexto: res.statusText };
      $main.classList.remove("opacity");
      $loader.classList.remove("opacity-active");
      this.insertResent(json["login"]);
      this.save(
        json["avatar_url"],
        json["login"],
        json["created_at"],
        `${json["twitter_username"] || ""}`,
        json["bio"] || "this perfil has no bio",
        json["public_repos"],
        json["followers"],
        json["following"],
        json["location"] || "?, ",
        json["blog"],
        json["html_url"]
      );
      this.printData(JSON.parse(this.db).length - 1);
    } catch (err) {
      $main.classList.remove("opacity");
      $loader.classList.remove("opacity-active");
      console.error(err);
      d.querySelector(".search").classList.add("err");
      setTimeout(() => {
        d.querySelector(".search").classList.remove("err");
      }, 900);
    }
  }
}
//instances
const request = new Request();
//events
d.addEventListener("click", (e) => {
  if (e.target.matches("#search")) {
    $input = e.target.parentElement.querySelector(".search-input-text").value;
    request.requestData($input);
  }
  if (e.target.matches(".resent-search-container img")) {
    request.selectResent(e.target);
  }
});
d.addEventListener("DOMContentLoaded", () => {
  request.printResent();
  request.insertResentAll();
});

$inputSearch.addEventListener("keypress", (e) => {
  if (e.code === "Enter") {
    let value = e.target.value;
    request.requestData(value);
  }
});
