// Automated Scheduling Engine
window.SchedulingEngine = {
    timeToMins(t) { const [h,m] = t.split(':'); return parseInt(h)*60 + parseInt(m); },
    minsToTime(m) { return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`; },

    generateSlots(doctorId, dateString) {
        const doc = window.StoreUtils.getDoctor(doctorId);
        if (!doc) return [];

        const d = new Date(dateString);
        const dayOfWeek = d.getDay(); // 0-6

        // Check working days
        if (!doc.config.workingDays.includes(dayOfWeek)) {
            return [{ type: 'unavailable', reason: 'Not a working day' }];
        }

        // Check leave
        const onLeave = window.MedoraData.leaves.some(l => l.doctorId === doctorId && l.date === dateString);
        if (onLeave) {
            return [{ type: 'leave', reason: 'Doctor is on leave' }];
        }

        const startMins = this.timeToMins(doc.config.hours.start);
        const endMins = this.timeToMins(doc.config.hours.end);
        const duration = doc.config.slotMins;
        const appts = window.MedoraData.appointments.filter(a => a.doctorId === doctorId && a.date === dateString);
        
        let slots = [];
        let curr = startMins;

        while (curr + duration <= endMins) {
            const time = this.minsToTime(curr);
            const endTime = this.minsToTime(curr + duration);
            
            // Check breaks
            const isBreak = doc.config.breaks.find(b => {
                const bs = this.timeToMins(b.start);
                const be = this.timeToMins(b.end);
                return (curr >= bs && curr < be) || (curr + duration > bs && curr + duration <= be);
            });

            if (isBreak) {
                slots.push({ type: 'break', time, endTime, label: isBreak.label });
            } else {
                const booked = appts.find(a => a.time === time);
                if (booked) {
                    slots.push({ type: 'booked', time, endTime, appointment: booked });
                } else {
                    slots.push({ type: 'available', time, endTime });
                }
            }
            curr += duration;
        }

        return slots;
    },

    getAffectedAppointments(doctorId, dateString) {
        return window.MedoraData.appointments.filter(a => a.doctorId === doctorId && a.date === dateString);
    },

    findReplacements(originalDocId, dateString, affectedTime) {
        const origDoc = window.StoreUtils.getDoctor(originalDocId);
        const peers = window.StoreUtils.getDocsByDept(origDoc.departmentId).filter(d => d.id !== originalDocId);
        
        return peers.map(peer => {
            const slots = this.generateSlots(peer.id, dateString);
            const isWorking = slots.length > 0 && slots[0].type !== 'unavailable' && slots[0].type !== 'leave';
            const hasSlot = slots.some(s => s.type === 'available' && s.time === affectedTime);
            
            return {
                doctor: peer,
                eligible: isWorking && hasSlot,
                reason: !isWorking ? 'Not working/On leave' : (!hasSlot ? 'Slot already booked' : 'Available')
            };
        });
    }
};
