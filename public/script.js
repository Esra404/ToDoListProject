let activeListIndex = null;

//listItem adında bir nesne oluşturup ve bu nesneyi  depolama alanına ekleme
function createListItem(listName) {

    const listItem = {
        name: listName,
        items: []
    };
    const lists = getListsFromStorage();
    lists.push(listItem);
    saveListsToStorage(lists);

    const modal = document.getElementById("myModal");
    const modalOpen = document.querySelector("#open");
    const modalClose = document.querySelector("#close");

    const openModal = () => modal.style.display = "block";
    const closeModal = () => modal.style.display = "none";

    modalOpen.addEventListener("click", openModal);
    modalClose.addEventListener("click", closeModal);
    const axios = require("axios");
    //Axios ile yeni liste eklemek için POST isteği yap
    const apiUrl = "http://localhost:3000/api/lists";
    axios
      .post(apiUrl, {
          userİd:userİd,
         listName: listName,
      })
      .then((response) => {
        console.log(
          "Yeni liste eklendi. Liste Kimlik Bilgisi (ID):",
          response.data.id
        );
      })
      .catch((error) => {
        console.error("Hata:", error.response.data);
      });

}


// itemName değerini kullanarak mevcut bir listenin öğelerine yeni bir öğe ekler ve güncellenmiş listeyi depolama alanına kaydeder.
function createItem(itemName) {
    const lists = getListsFromStorage();
    const items = lists[activeListIndex].items;
    items.push({
        name: itemName,
        completed: false
    });
    saveListsToStorage(lists);


}
//belirli indeksdeki bir öğeyi liste içinden silme 
function deleteItem(itemIndex) {
    const lists = getListsFromStorage();
    const items = lists[activeListIndex].items;
    items.splice(itemIndex, 1);
    saveListsToStorage(lists);
}
//öğenin tamamlanma durumunu tersine çevirme
function toggleItemCompletion(itemIndex) {
    const lists = getListsFromStorage();
    const item = lists[activeListIndex].items[itemIndex];
    item.completed = !item.completed;
    saveListsToStorage(lists);
}
//liste öğesinin silinmesi 
function deleteList() {
    const lists = getListsFromStorage();
    lists.splice(activeListIndex, 1);
    setActiveList(null);
    saveListsToStorage(lists);
}

function editListName(listName) {
    const lists = getListsFromStorage();
    lists[activeListIndex].name = listName;
    saveListsToStorage(lists);
}

function editItemName(itemIndex, itemName) {
    const lists = getListsFromStorage();
    lists[activeListIndex].items[itemIndex].name = itemName;
    saveListsToStorage(lists);
}

function renderLists() {

    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';
    const lists = getListsFromStorage();

    lists.forEach((list, listIndex) => {
        const listElement = document.createElement('li');
        const listNameElement = document.createElement('span');
        listNameElement.innerHTML = list.name;



        listNameElement.addEventListener('click', () => {
            setActiveList(listIndex);
            renderItems();
        });

        const editListNameInput = createInput('text', list.name, (newListName) => {
            if (newListName !== '') {
                editListName(newListName);
            }
        });

        const editListNameButton = createButton('Düzenle', () => {
            editListNameInput.style.display = 'inline-block';
            editListNameInput.focus();
        });
        editListNameButton.classList.add('edit-button');

        //yanlışlıkla bir listenin silinmesini önleme ve kullanıcının isteği doğrultusunda listenin silinmesini sağlayama
        const deleteListButton = createButton('Sil', (event) => {
            event.preventDefault();
            if (confirm('Listeyi silmek istediğinize emin misiniz?')) {
                deleteList();
            }
        });
        deleteListButton.classList.add('delete-button');

        document.getElementById('item-container').appendChild(deleteListButton);


        listElement.appendChild(listNameElement);
        listElement.appendChild(editListNameInput);
        listElement.appendChild(deleteListButton);
        listElement.appendChild(editListNameButton);

        if (listIndex === activeListIndex) {
            listElement.classList.add('active');
        }

        const listItems = list.items;
        const completedItems = listItems.filter(item => item.completed);
        if (completedItems.length === listItems.length && listItems.length > 0) {
            listElement.classList.add('completed');
        }


        listContainer.appendChild(listElement);
    });
}

function renderItems() {
    const itemContainer = document.getElementById('item-container');
    itemContainer.innerHTML = '';

    if (activeListIndex !== null) {
        const lists = getListsFromStorage();
        const items = lists[activeListIndex].items;

        const listNameElement = document.createElement('span');
        listNameElement.innerHTML = "Liste: " + lists[activeListIndex].name;

        itemContainer.appendChild(listNameElement);


        items.forEach((item, itemIndex) => {
            const itemElement = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('change', () => toggleItemCompletion(itemIndex));

            const itemNameElement = document.createElement('span');
            itemNameElement.innerHTML = item.name;
            itemNameElement.addEventListener('click', () => toggleItemCompletion(itemIndex));

            const editItemNameInput = createInput('text', item.name, (newItemName) => {
                if (newItemName !== '') {
                    editItemName(itemIndex, newItemName);
                }
            });


            const editItemNameButton = createButton('Düzenle', () => {
                editItemNameInput.style.display = 'inline-block';
                editItemNameInput.focus();
            });
            editItemNameButton.classList.add('edit-button');

            const deleteButton = createButton('Sil', (event) => {
                event.stopPropagation();
                deleteItem(itemIndex);
            });
            deleteButton.classList.add('delete-button');

            itemElement.appendChild(checkbox);
            itemElement.appendChild(itemNameElement);
            itemElement.appendChild(deleteButton);
            itemElement.appendChild(editItemNameInput);
            itemElement.appendChild(editItemNameButton);
            
            if (item.completed) {
                itemElement.classList.add('completed');
            }

            itemContainer.appendChild(itemElement);
        });
    }
}

function setActiveList(listIndex) {
    activeListIndex = listIndex;
    renderLists();
    renderItems();
}

function getListsFromStorage() {
    return JSON.parse(localStorage.getItem('shoppingLists')) || [];
}

function saveListsToStorage(lists) {
    localStorage.setItem('shoppingLists', JSON.stringify(lists));
    renderLists();
    renderItems();
}

function createInput(type, value, onBlur) {
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.style.display = 'none';

    input.addEventListener('blur', (event) => {
        input.style.display = 'none';
        const newValue = event.target.value.trim();
        if (typeof onBlur === 'function') {
            onBlur(newValue);
        }
    });

    return input;
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.addEventListener('click', onClick);
    return button;
}

const listForm = document.getElementById('list-form');
listForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const listInput = document.getElementById('list-input');
    const listName = listInput.value.trim();
    if (listName !== '') {
        createListItem(listName);
        listInput.value = '';
    }
});

const itemForm = document.getElementById('item-form');
itemForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const itemInput = document.getElementById('item-input');
    const itemName = itemInput.value.trim();
    if (itemName !== '') {
        createItem(itemName);
        itemInput.value = '';
    }
});
const mainDiv = document.querySelector('.main');
const sidebarDiv = document.querySelector('.sidebar');

sidebarDiv.addEventListener('click', () => {
    if (mainDiv.style.display === 'none') {
        mainDiv.style.display = 'block';
    } else {
        mainDiv.style.display = 'none';
    }
});

renderLists();
renderItems();


// Giriş Formu
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  // API isteği yap ve giriş işlemini gerçekleştir
  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then((response) => response.json())
    .then((data) => {
      // Giriş başarılı
      console.log(data);
      // İlgili işlemleri gerçekleştir (örneğin kullanıcıyı yönlendir)
    })
    .catch((error) => {
      // Giriş başarısız
      console.error(error);
      // Hata mesajını göster veya ilgili işlemleri gerçekleştir
    });
});

// Kayıt Formu
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  // API isteği yap ve kayıt işlemini gerçekleştir
  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then((response) => response.json())
    .then((data) => {
      // Kayıt başarılı
      console.log(data);
      // İlgili işlemleri gerçekleştir (örneğin kullanıcıyı yönlendir)
    })
    .catch((error) => {
      // Kayıt başarısız
      console.error(error);
      // Hata mesajını göster veya ilgili işlemleri gerçekleştir
});
});