package com.facebook.react.uimanager;

public abstract class ViewManager<T, C> {
    public abstract String getName();
    public abstract T createViewInstance(C context);
}