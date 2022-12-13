document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //By default, load the inbox
  load_mailbox('inbox');

  //Send Email
  document.querySelector('#compose-form').onsubmit = send_email;
  
});

function compose_email() {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //load mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(email => {
      const element = document.createElement('div');
      if(mailbox === 'sent'){
        let recipients = ''
        email.recipients.forEach(recipient=> recipients += recipient + ', ')
        element.innerHTML = `To: ${recipients}<br>
                           Subject: ${email.subject}<br>
                           time: ${email.timestamp}` ;
      } else {
        element.innerHTML = `From: ${email.sender}<br>
                           Subject: ${email.subject}<br>
                           time: ${email.timestamp}` ;
      }
      
      element.style.border = '1px solid black';
      element.style.padding = '10px'
      element.style.margin = '10px'
      if(email.read === false){
        element.style.backgroundColor = 'green'
      } else{
        element.style.backgroundColor = 'white'
      }
      document.querySelector('#emails-view').append(element)
      
      //onclick
      element.addEventListener('click', ()=>{
          view_email(email, mailbox);
      }) 

    });

  })
};


//send email
function send_email() {
    const recipients = document.querySelector('#compose-recipients').value 
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value
    
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    }).then(response => response.json())
    .then(result => {
      console.log(result)
    })
    .catch(err => console.log(err));
    
    //load inbox mail
    load_mailbox('inbox')

  return false;
};

function view_email(email, mailbox){

  //show view_email hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  const element = document.createElement('div');
  element.innerHTML = `From: ${email.sender}  <span id="time">time: ${email.timestamp}</span><br>
                        Subject: ${email.subject}<br>
                        Body:<br> 
                        &nbsp; &nbsp; ${email.body}<br><br>` ;
  element.style.border = '1px solid black';
  element.style.padding = '10px'
  element.style.margin = '10px'
  
  //archive button
  const btn_archive = document.createElement('button');
  if(!email.archived && mailbox !== 'sent'){
    btn_archive.innerHTML = "Archive"
    btn_archive.addEventListener('click', ()=>{
      fetch(`/emails/${email.id}`,{
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      }).then(()=>
        //load user's inbox
        load_mailbox('inbox')
      );
    });
    element.appendChild(btn_archive);

  } else if(email.archived && mailbox !== 'sent') {
    
    btn_archive.innerHTML = "Unarchive"
    btn_archive.addEventListener('click', ()=>{
      fetch(`/emails/${email.id}`,{
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      }).then(()=>
        //load user's inbox
        load_mailbox('inbox')
      );
      
    });
   
    element.appendChild(btn_archive);
  }

  //Reply button
  const btn_reply = document.createElement('button');
  btn_reply.innerHTML = 'Reply';
  btn_reply.style.marginLeft = '70%'
  btn_reply.addEventListener('click',()=>{

    //show componse-view hide other views.
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = email.sender;
    if(email.subject.substr(0,3) !== 'RE:') {
        email.subject = 'RE: ' + email.subject;
    }
    
    document.querySelector('#compose-subject').value = email.subject;
    const body = `"On ${email.timestamp} ${email.sender} wrote:" ${email.body}. `;

    document.querySelector('#compose-body').value =  body;


  });
  element.appendChild(btn_reply);
    
  
  //main view-email
  document.querySelector('#view-email').innerHTML = ""
  document.querySelector('#view-email').append(element)
  
  //change read true
  fetch(`/emails/${email.id}`,{
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

