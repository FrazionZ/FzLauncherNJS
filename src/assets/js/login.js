const path = require('path')
var appRoot = require('app-root-path');
const FZUtils = require(path.join(appRoot.path, '/src/assets/js/utils.js'))
const FzPage = require(path.join(appRoot.path, '/src/assets/js/FzPage.js'))
const Authenticator = require('azuriom-auth').Authenticator;
class Login extends FzPage {

	constructor(document) {
		super(document);
		var instance = this;
		var twofaInstance = (($('.addAccountContinue').length == 1) ? false : true);
		$('body').on('keypress', function(e) {
			if (e.which == 13) {
				instance.initAddAccount(twofaInstance);
			}
		});
		$('.addAccountContinue').on('click', async () => {
			instance.initAddAccount(twofaInstance);
		});
		if (twofaInstance) {
			var debug = true;
			var _pincode = [];
			var $form = $('#TWOFAForm');
			var $group = $form.find('.form-group-2FA');
			var $inputs = $group.find(':input');
			var $first = $form.find('[name=pincode-1]'),
				$second = $form.find('[name=pincode-2]'),
				$third = $form.find('[name=pincode-3]'),
				$fourth = $form.find('[name=pincode-4]'),
				$fifth = $form.find('[name=pincode-5]'),
				$sixth = $form.find('[name=pincode-6]');

			$inputs
				.on('keyup', function(event) {
					var code = event.keyCode || event.which;
					if (code === 9 && !event.shiftKey) {
						event.preventDefault();
						$('.button--primary').focus();
					}
				})
				.inputmask({
					mask: '9',
					placeholder: '',
					showMaskOnHover: false,
					showMaskOnFocus: false,
					clearIncomplete: true,
					onincomplete: function() {
						!debug || console.log('inputmask incomplete');
					},
					oncleared: function() {
						var index = $inputs.index(this),
							prev = index - 1,
							next = index + 1;

						if (prev >= 0) {
							$inputs.eq(prev).val('');
							$inputs.eq(prev).focus();
							_pincode.splice(-1, 1)
						} else {
							return false;
						}

						!debug || console.log('[oncleared]', prev, index, next);
					},
					onKeyValidation: function(key, result) {
						var index = $inputs.index(this),
							prev = index - 1,
							next = index + 1;

						if (prev < 6) {
							$inputs.eq(next).focus();
						}

						!debug || console.log('[onKeyValidation]', index, key, result, _pincode);
					},
					onBeforePaste: function(data, opts) {
						$.each(data.split(''), function(index, value) {
							$inputs.eq(index).val(value);
							!debug || console.log('[onBeforePaste:each]', index, value);
						});
						return false;
					}
				});

			$('[name=pincode-1]').focus()

			$('[name=pincode-1]')
				.on('focus', function(event) {
					!debug || console.log('[1:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						$('[name=pincode-2]').focus();
						!debug || console.log('[1:oncomplete]', _pincode);
					}
				});

			$('[name=pincode-2]')
				.on('focus', function(event) {
					if (!($first.val().trim() !== '')) {
						event.preventDefault();
						_pincode = [];
						$inputs
							.each(function() {
								$(this).val('');
							});
						$first.focus();
					}

					!debug || console.log('[2:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						$('[name=pincode-3]').focus();

						!debug || console.log('[2:oncomplete]', _pincode);
					}
				});

			$('[name=pincode-3]')
				.on('focus', function(event) {
					if (!($first.val().trim() !== '' &&
							$second.val().trim() !== '')) {
						event.preventDefault();
						_pincode = [];
						$inputs
							.each(function() {
								$(this).val('');
							});
						$first.focus();
					}

					!debug || console.log('[3:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						$('[name=pincode-4]').focus();

						!debug || console.log('[3:oncomplete]', _pincode);
					}
				});

			$('[name=pincode-4]')
				.on('focus', function(event) {
					if (!($first.val().trim() !== '' &&
							$second.val().trim() !== '' &&
							$third.val().trim() !== '')) {
						event.preventDefault();
						_pincode = [];
						$inputs
							.each(function() {
								$(this).val('');
							});

						$first.focus();
					}

					!debug || console.log('[4:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						$('[name=pincode-5]').focus();

						!debug || console.log('[4:oncomplete]', _pincode);
					}
				});

			$('[name=pincode-5]')
				.on('focus', function(event) {
					if (!($first.val().trim() !== '' &&
							$second.val().trim() !== '' &&
							$third.val().trim() !== '' &&
							$fourth.val().trim() !== '')) {
						event.preventDefault();
						_pincode = [];
						$inputs
							.each(function() {
								$(this).val('');
							});
						$first.focus();
					}

					!debug || console.log('[5:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						$('[name=pincode-6]').focus();

						!debug || console.log('[5:oncomplete]', _pincode);
					}
				});

			$('[name=pincode-6]')
				.on('focus', function(event) {
					if (!($first.val().trim() !== '' &&
							$second.val().trim() !== '' &&
							$third.val().trim() !== '' &&
							$fourth.val().trim() !== '' &&
							$fifth.val().trim() !== '')) {
						event.preventDefault();
						_pincode = [];
						$inputs
							.each(function() {
								$(this).val('');
							});
						$first.focus();
					}

					!debug || console.log('[6:focus]', _pincode);
				})
				.inputmask({
					oncomplete: function() {
						_pincode.push($(this).val());
						if (_pincode.length !== 6) {
							_pincode = [];
							$inputs
								.each(function() {
									$(this).val('');
								});
							$('[name=pincode-1]').focus();
						} else {
							$inputs.each(function() {
								$(this).prop('disabled', true);
							});
							_pincode = _pincode.join('')
							instance.initAddAccount(true, _pincode)
						}
					}
				});
		}
	}

	async initAddAccount(twofa, code) {
		$('.addAccountContinue').attr('disabled', 'disabled')
		//$('.addAccountContinue').html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
		var form = ((twofa) ? $('#TWOFAForm') : $('#addAccountForm'));
		var userEmail = form.find('#email');
		var userPassword = form.find('#password');
		var user2FA = ((twofa) ? code : "none");
		FZUtils.loadURL('/logging', [{
			form: {
				username: userEmail.val(),
				password: userPassword.val(),
				user2FA: user2FA
			}
		}, {
			type: "form"
		}])
	}



	updateProfile(idProfil, key, value) {
		switch (key) {
			case 'token':
				this.profiles[idProfil].token = value;
				break;
			default:
				console.log(`Aucune donnée ${key} n'est modifiable`);
				break;
		}

		this.fs.writeFile(this.dirFzLauncherDatas + "/profiles.json", JSON.stringify(this.profiles), function writeJSON(err) {
			if (err) return console.log(err);
		});
	}

	loadProfiles() {
		if (this.store.has('profiles'))
			return this.store.get('profiles')
		else
			return [];
	}

}

module.exports = Login;