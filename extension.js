const { St, GLib } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;
const DISPLAY_OUTPUT = 'VGA-1';

class UserDebBrightnessExtension {
    constructor() {
        this._indicator = null;
        this._slider = null;
    }

    _setBrightness(value) {
        const brightness = Math.max(0.1, Math.min(1.0, value));

        GLib.spawn_async(
            null,
            [
                'xrandr',
                '--output', DISPLAY_OUTPUT,
                '--brightness', brightness.toFixed(2)
            ],
            null,
            GLib.SpawnFlags.SEARCH_PATH,
            null
        );
    }

    enable() {
        this._indicator = new PanelMenu.Button(
            0.0,
            'UserDebBrightness',
            false
        );

        const icon = new St.Icon({
            icon_name: 'display-brightness-symbolic',
            style_class: 'system-status-icon'
        });

        this._indicator.add_child(icon);

        const sliderItem = new PopupMenu.PopupBaseMenuItem({
            activate: false,
            can_focus: false
        });

        this._slider = new Slider.Slider(0.5);
        this._slider.x_expand = true;

        this._slider.connect('notify::value', () => {
            this._setBrightness(this._slider.value);
        });

        sliderItem.add_child(this._slider);
        this._indicator.menu.addMenuItem(sliderItem);

        this._indicator.menu.addMenuItem(
            new PopupMenu.PopupSeparatorMenuItem()
        );

        const resetItem = new PopupMenu.PopupMenuItem(
            'Ripristina luminosità (100%)'
        );

        resetItem.connect('activate', () => {
            this._slider.value = 1.0;
            this._setBrightness(1.0);
        });

        this._indicator.menu.addMenuItem(resetItem);

        Main.panel.addToStatusArea(
            'user-deb-brightness',
            this._indicator
        );
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._slider = null;
    }
}

function init() {
    return new UserDebBrightnessExtension();
}
