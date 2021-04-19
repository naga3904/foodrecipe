if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      console.log("service Worker registered", reg);
      window.onload = ()=>{
        reg.update();
      }
    })
    .catch((err) => {
      console.log("service Worker not registered", err);
    });
}

const AddRecipe = document.getElementById("add-btn");
const recipetitle = document.getElementById("title");
const recipeingredients = document.getElementById("ingredients");
const recipes = document.getElementById("recipes");

(function () {
  let db = null;
  let objectStore = null;
  const request = indexedDB.open("ninjadb", 1);
  request.addEventListener("error", (e) => {
    console.log("dberror", e);
  });
  request.addEventListener("success", (e) => {
    db = e.target.result;
  });
  request.addEventListener("upgradeneeded", (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("ninjastore")) {
      objectStore = db.createObjectStore("ninjastore", {
        keyPath: "id",
      });
    }
  });
  const load = () => {
    window.onload = setTimeout(() => {
      let tx = db.transaction("ninjastore", "readonly");
      tx.oncomplete = (e) => {
        console.log("reload", e);
      };
      tx.onerror = (e) => {
        console.log("reload", e);
      };
      let store = tx.objectStore("ninjastore");
      let getReq = store.getAll();
      getReq.onsuccess = (e) => {
        let request = getReq;
        recipes.innerHTML = request.result.map((i) => {
          return `
                    <div class="card-panel recipe white row">
                    <img src="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg/preview" alt="recipe thumb">
                    <div class="recipe-details">
                        <div class="recipe-title">${i.title}</div>
                        <div class="recipe-ingredients">${i.ingredients}</div>
                    </div>
                    <div class="recipe-delete">
                        <button class='delete-btn btn-small' value=${i.id}><i class="material-icons" >delete_outline</i></button>
                    </div>
                    </div>
                    `;
        });
        const Deletebtn = document.querySelectorAll('.delete-btn');
        Deletebtn.forEach((Delete)=>{
          Delete.addEventListener('click',() => {
              let tx = db.transaction("ninjastore", "readwrite");
              const id = Delete.value;
              tx.oncomplete = (e) => {
                console.log("deletedata", e);
              };
              tx.onerror = (e) => {
                console.log("deletedata ", e);
              };
              let store = tx.objectStore("ninjastore");
              let req = store.delete(parseInt(id));
              req.onsuccess = (e) => {
                console.log("data deleted");
                load();
              };
              req.onerror = (e) => {
                console.log("delete-data req error", e);
              };
            });
        })
      };
    }, 2000);
  };
  load();

  
  AddRecipe.addEventListener("click", () => {
    let title = recipetitle.value;
    let ingredients = recipeingredients.value;
    let data = {
      id: Math.floor(Math.random() * 100),
      title,
      ingredients,
    };
    if (data.title && data.ingredients) {
      let tx = db.transaction("ninjastore", "readwrite");
      tx.oncomplete = (e) => {
        console.log(e);
      };
      tx.onerror = (e) => {
        console.log(e);
      };
      let store = tx.objectStore("ninjastore");
      let query = store.add(data);

      query.onerror = (e) => {
        console.log("error add");
      };

      query.onsuccess = (e) => {
        console.log("success add");
        title.value = "";
        ingredients.value = "";
        alert('Added data Successfully');
        load();
      };
    } else {
      alert("Add some data please");
    }
  });

})();
