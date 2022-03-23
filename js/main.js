'use strict'

const alertModal = $.modal({
  title: 'Result message',
  closable: true,
  width: '400px',
  footerButtons: [
    {text: 'Close', type: 'primary', handler() {
      alertModal.close()
    }}
  ]
})

document.addEventListener('DOMContentLoaded', function () {
  const form = document.forms.testForm
  const imageFile = document.querySelector('#formFile')

  if (form) {
    form.addEventListener('submit', formSend)

    async function formSend(event) {
      event.preventDefault()

      let error = formValidate(form)

      let formData = new FormData(form)
      formData.append('image', imageFile)

      if (error === 0) {
        form.classList.add('_sending')
        let response = await fetch('sendmail.php', {
          method: 'POST',
          body: formData
        })
        if (response.ok) {
          let result = await response.json()
          alertModal.setContent(`<p>${result.message}</p>`)
          alertModal.open()

          filePreview.innerHTML = ''
          form.reset()
          form.classList.remove('_sending')
        } else {
          alertModal.setContent(`<p>Sending Error</p>`)
          alertModal.open()
          form.classList.remove('_sending')
        }
      } else {
        alertModal.setContent(`<p>Fill required fields</p>`)
        alertModal.open()
      }
    }

    function formValidate(form) {
      let error = 0
      let formReq = form.querySelectorAll('._req')

      for (let i = 0; i < formReq.length; i++) {
        const input = formReq[i]

        formRemoveError(input)

        if (input.classList.contains('_name')) {
          if (nameValidation(input)) {
            formAddError(input)
            error++
          }
        } else if (input.classList.contains('_email')) {
          if (emailValidation(input)) {
            formAddError(input)
            error++
          } 
        } else if (input.type === 'checkbox' && input.checked === false) {
          formAddError(input)
          error++
        } else {
          if (input.value === '') {
            formAddError(input)
            error++
          }
        }
      }
      return error
    }
  }

  function formAddError(elem) {
    elem.parentElement.classList.add('_error')
    elem.classList.add('_error')
  }

  function formRemoveError(elem) {
    elem.parentElement.classList.remove('_error')
    elem.classList.remove('_error')
  }

  function emailValidation(elem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(elem.value)
  }

  function nameValidation(elem) {
    return !/^\p{L}{2,}/u.test(elem.value)
  }

  const formFile = form.querySelector('#formFile')
  const filePreview = form.querySelector('#filePreview')

  formFile.addEventListener('change', () => {
    uploadFile(formFile.files[0])
  })

  function uploadFile(file) {
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alertModal.setContent(`<p>Only images allowed</p>`)
      alertModal.open()
      formFile.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alertModal.setContent(`<p>File size must be less than 2 MB</p>`)
      alertModal.open()
      return
    }

    let reader = new FileReader()

    reader.onload = function() {
      const url = URL.createObjectURL(file)
      filePreview.innerHTML = `<img src="${url}" alt="Photo"/>`
    }
    
    reader.onerror = function() {
      alertModal.setContent(`<p>FileReader Error</p>`)
      alertModal.open()
    }

    reader.readAsDataURL(file)
  } 
})