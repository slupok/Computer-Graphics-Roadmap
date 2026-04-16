---
title: "Коротко о кватернионах"
date: "2026-04-14"
description: "Очень короткое и понятное знакомство с кватернионами"
tags: ["quaternion"]
---

# Небольшое знакомство

**Кватернион** — это гиперкомплексное число, которое способно определять вращение объекта в пространстве. 
:::center
$$w + xi + yj + zk$$. 
:::

Мнимая часть $(x,y,z)$ представляет вектор, который определяет направление вращения. Вещественная часть $(w)$ определяет угол, на который будет совершено вращение. Его основное отличие от всем привычных углов Эйлера в том, что нам достаточно иметь **один** вектор, который будет определять направление вращения, вместо **трех** линейно независимых осей, которые вращают объект в 3 подпространствах. 

> [!NOTE]
> Строго говоря, мнимая часть $(x,y,z) = \sin(\theta/2)\cdot\bar{v}$, а $w = \cos(\theta/2)$, где $\theta$ — угол вращения, а $\bar{v}$ — ось вращения.

Рекомендую две статьи, в которых подробно рассказывается о кватернионах: [Раз](https://habr.com/ru/articles/426863/) и [Два](https://nabbla1.livejournal.com/172771.html)

Теперь, когда у нас есть минимальные представления о кватернионах, давайте поймем, как вращать вектор.

## Формула вращения вектора 

:::center
$$\vec{v}' = q * \vec{v} * \bar{q}$$
:::

, где
- $\vec{v}'$ — искомый вектор
- $\vec{v}$ — исходный вектор 
- $q$ — кватернион 
- $\bar{q}$ — обратный (а точнее сопряженный) кватернион

> [!NOTE]
> При использовании единичного кватерниона ($|q| = 1$) сопряжённый совпадает с обратным.

Для начала, дадим понятие сопряженного единичного кватерниона — это кватернион с противоположной по знаку мнимой частью.

$$q = w + xi + yj + zk$$

$$\bar{q} = w - xi - yj - zk$$

**Вычисление $\vec{v} * \bar{q}$**

Посчитаем $\vec{v} * \bar{q}$ и обозначим как $M$:
$$
\begin{align*}
 & M = \vec{v} * \bar{q} = (0 + v_x i + v_y j + v_z k)(q_w - q_x i - q_y j - q_z k) = \\
 & = \textcolor{red}{v_x q_w i} + \textcolor{purple}{v_x q_x} - \textcolor{blue}{v_x q_y k} + \textcolor{green}{v_x q_z j} + \\
 & + \textcolor{green}{v_y q_w j} + \textcolor{blue}{v_y q_x k} + \textcolor{purple}{v_y q_y} - \textcolor{red}{v_y q_z i} + \\
 & + \textcolor{blue}{v_z q_w k} - \textcolor{green}{v_z q_x j} + \textcolor{red}{v_z q_y i} + \textcolor{purple}{v_z q_z}
\end{align*}
$$

Теперь выпишем отдельные компоненты и из этого произведения соберем новый кватернион:
$$
\begin{align*}
 & M = u_w + u_x i + u_y j + u_z k \\
 & u_w = \textcolor{purple}{v_x q_x + v_y q_y + v_z q_z} \\
 & u_x i = \textcolor{red}{(v_x q_w - v_y q_z + v_z q_y)i} \\
 & u_y j = \textcolor{green}{(v_x q_z + v_y q_w - v_z q_x)j} \\
 & u_z k = \textcolor{blue}{(-v_x q_y + v_y q_x + v_z q_w)k}
\end{align*}
$$

**Вычисление $q * M$**

Посчитаем оставшуюся часть, т.е. $q * M$ и получим искомый вектор.

Примечание: Чтобы не загромождать вычисления, приведём только мнимую (векторную) часть этого произведения — именно она характеризует искомый вектор.

$$
\begin{align*}
 & \vec{v}' = q * M = (q_w + q_x i + q_y j + q_z k)(u_w + u_x i + u_y j + u_z k) = \\
 & = \textcolor{red}{q_w u_x i} + \textcolor{green}{q_w u_y j} + \textcolor{blue}{q_w u_z k} + \\
 & + \textcolor{red}{q_x u_w i} + \textcolor{blue}{q_x u_y k} - \textcolor{green}{q_x u_z j} + \\
 & + \textcolor{green}{q_y u_w j} - \textcolor{blue}{q_y u_x k} + \textcolor{red}{q_y u_z i} + \\
 & + \textcolor{blue}{q_z u_w k} + \textcolor{green}{q_z u_x j} - \textcolor{red}{q_z u_y i}
\end{align*}
$$

**Компоненты результирующего вектора**

$$
\begin{align*}
v'_x &= \textcolor{red}{q_w u_x + q_x u_w + q_y u_z - q_z u_y} \\
v'_y &= \textcolor{green}{q_w u_y - q_x u_z + q_y u_w + q_z u_x} \\
v'_z &= \textcolor{blue}{q_w u_z + q_x u_y - q_y u_x + q_z u_w} \\
v'   &= (v'_x, v'_y, v'_z)
\end{align*}
$$

Реализация:
```cpp
struct Vector3
{
    float x, y, z;
};

struct Quaternion
{
    float x, y, z, w;
};

// Создание кватерниона из оси и угла
Quaternion CreateQuaternion(Vector3 axis, float angle)
{
    float half = angle / 2.0f;
    float s    = sinf(half);
    return { axis.x * s, axis.y * s, axis.z * s, cosf(half) };
}

// Вращение вектора на кватернион
Vector3 QuaternionRotation(Vector3 v, Quaternion q)
{
        float u0 = v.x * q.x + v.y * q.y + v.z * q.z;
        float u1 = v.x * q.w - v.y * q.z + v.z * q.y;
        float u2 = v.x * q.z + v.y * q.w - v.z * q.x;
        float u3 = -v.x * q.y + v.y * q.x + v.z * q.w;
        Quaternion M = { u1, u2, u3, u0 };
        
        Vector3 resultVector;
        resultVector.x = q.w * M.x + q.x * M.w + q.y * M.z - q.z * M.y;  
        resultVector.y = q.w * M.y - q.x * M.z + q.y * M.w + q.z * M.x;
        resultVector.z = q.w * M.z + q.x * M.y - q.y * M.x + q.z * M.w;
        
        return resultVector;
}
```