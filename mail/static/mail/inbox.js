document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit button
  document.querySelector("#compose-form").addEventListener('submit', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
};

function qwerty(recip, sub, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recip;
  document.querySelector('#compose-subject').value = sub;
  document.querySelector('#compose-body').value = body;
};




function open_mail(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // View the email's contents
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'block';

    // make a div for the contents
    document.querySelector('#single-email-view').innerHTML = `
    <h7><b>From: </b>${email.sender}</h7><br>
    <h7><b>To: </b>${email.recipient}</h7><br>
    <h7><b>Subject: </b>${email.subject}</h7><br>
    <h7><b>Timestamp: </b>${email.timestamp}</h7><br>
    <hr>
    <p>${email.body}</p>
    `;
    // change email to read
    if(!email.read) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    // get current username
    const username = document.querySelector('#username').innerHTML;

    // Un/archive emails
    const element = document.createElement('button');
    element.innerHTML = email.archived ? 'Unarchive' : 'Archive';
    element.className = email.archived ? 'btn btn-light' : 'btn btn-dark';
    element.classList.add("reply");
    if(username != email.recipients){
      console.log("True");
      element.style.display = 'none';
    };
    element.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
    .then(() => {
      load_mailbox('inbox')
    });
    });
    document.querySelector('#single-email-view').append(element);

    // reply to emails
    const reply = document.createElement('button');
    reply.innerHTML = 'Reply';
    reply.id = 'reply';
    reply.className = 'btn btn-primary';
    reply.classList.add("reply");

    reply.addEventListener('click', function() {
      bit = email.subject
      if(bit.split(' ', 1)[0] == 'Re:') {
        sub = email.subject
      } else {
        sub = `Re: ${email.subject}`
      }



      qwerty(email.sender, sub, `




On ${email.timestamp} ${email.sender} wrote:
${email.body}`);
    });

    document.querySelector('#single-email-view').append(reply);



});
};







function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // get emails for each mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // get all emails as an array
    emails.forEach(mail => {

      // make a div for each email
      const new_mail = document.createElement('div');

      new_mail.innerHTML = `
      <h7>${mail.sender} <b>${mail.subject}</b></h7>
      <p>${mail.timestamp}</p>
      `;

      // change mail color when un/read
      new_mail.className = mail.read ? 'read': 'unread';
      // Click event to open email
      new_mail.addEventListener('click', function() {
        open_mail(mail.id)
      });
      document.querySelector('#emails-view').append(new_mail);
    })

});
}





function send_email(event){
  event.preventDefault();


   // log fields
   const recip = document.querySelector('#compose-recipients').value;
   const sub = document.querySelector('#compose-subject').value;
   const body = document.querySelector('#compose-body').value;

  //  send data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recip,
        subject: sub,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}