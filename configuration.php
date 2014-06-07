<?php

function getConfig($key, $defaultValue)
{
    return isset($GLOBALS[$key]) ? $GLOBALS[$key] : $defaultValue;
}
