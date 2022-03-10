<template>
    <div class="popup-wrapper">
        <h1 class="title">Simple Toggle Sites</h1>
        <!-- <div class="buttons">
            <button type="button" class="state-off" :class="{'is-active': !active}" @click="setActive(false)">Off</button>
            <button type="button" class="state-on" :class="{'is-active': active}" @click="setActive(true)">On</button>
        </div> -->
        <div class="criteria-wrapper">
            <div class="label">
                <div class="criteria-title">Sender Address</div>
                <div class="criteria-value">example@mail.com</div>
            </div>
            <div class="label">
                <div class="criteria-title">Sender Address</div>
                <div class="criteria-value">example@mail.com</div>
            </div>
            <div class="label">
                <div class="criteria-title">Sender Address</div>
                <div class="criteria-value">example@mail.com</div>
            </div>
            <div class="label">
                <div class="criteria-title">Sender Address</div>
                <div class="criteria-value">example@mail.com</div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            active: false,
            list: [],
            // icons: {
            //     active: 'images/icon-48x48.png',
            //     inactive: 'images/icon-48x48-off.png'
            // }
        }
    },
    created() {
        chrome.storage.sync.get(['toggleSitesActive', 'toggleSitesList'], (result) => {
            this.active = result.toggleSitesActive;
            this.list = result.toggleSitesList;
        });
    },
    methods: {
        setActive(active) {
            this.active = active;
            chrome.storage.sync.set({
                toggleSitesActive: active
            }, () => {});
            // chrome.browserAction.setIcon({
            //     path: this.icons[active ? 'active' : 'inactive']
            // });
            console.log("GMAIL",window.gmail)
        },
        saveList() {
            chrome.storage.sync.set({
                toggleSitesList: this.list
            }, () => {});
        }
    },
    mounted(){
        console.log("DOCUMENT:", document)
    }
}
</script>