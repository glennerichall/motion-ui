import {fetch} from "./fetch";
import {notificationsUrl} from "../constants";

let notifications = null;

export async function fetchNotifications() {
    if (notifications == null) {
        notifications = await fetch(notificationsUrl);
    }
    return notifications;
}

export function getNotifications() {
    return notifications;
}