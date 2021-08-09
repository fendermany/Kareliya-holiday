"use strict";



window.addEventListener('DOMContentLoaded', (e) => {
	// Tabs
	const tabs = document.querySelectorAll('.tabheader__item'),
		tabsContent = document.querySelectorAll('.tabcontent'),
		tabsParent = document.querySelector('.tabheader__items');

	const deleteTabs = () => {
		tabsContent.forEach(tab => {
			tab.classList.remove('visible');
			tab.classList.remove('fade');
			tab.classList.add('hidden');
		});
		tabs.forEach(tab => {
			tab.classList.remove('tabheader__item_active');
		});
	};

	const createTabs = (i = 1) => { // Чтобы выбрать первый активный tab - меняем цифру
		tabsContent[i].classList.remove('hidden');
		tabsContent[i].classList.add('visible');
		tabsContent[i].classList.add('fade');
		tabs[i].classList.add('tabheader__item_active');
	}; 

	deleteTabs();
	createTabs();

	tabsParent.addEventListener('click', (e) => {
		const target = e.target;
		if (target && target.classList.contains('tabheader__item')) {
			tabs.forEach((item, i) => {
				if (target == item) {
					deleteTabs();
					createTabs(i);
				}
			});
		}
	});
});